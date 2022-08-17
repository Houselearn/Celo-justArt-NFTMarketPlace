// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract JustArtMarket is Ownable, ReentrancyGuard {
    // EVENTS
    event ItemCreated(
        string collection,
        address indexed owner,
        string itemId,
        uint256 price
    );

    event ItemRemoved(address indexed owner, string itemName, string itemId);

    event ItemRelisted(
        address indexed owner,
        string itemName,
        string itemId,
        uint256 price
    );

    event ItemSold(
        address indexed buyer,
        string itemName,
        string itemId,
        uint256 price
    );

    event NewMarketFee(address owner, uint256 newPercentage);

    // STRUCTS
    enum Type {
        ADD,
        REMOVE,
        BUY
    }

    struct Transaction {
        uint256 id;
        Type tranType;
        address from;
        uint256 price;
        uint256 createdAt;
    }

    struct Item {
        string id;
        string name;
        string description;
        string image;
        string location;
        uint256 price;
        address owner;
        bool isItemListed;
        Transaction[] history;
    }

    // VARIABLES
    uint256 marketFeePercentage;
    uint256 itemCount;
    mapping(string => Item) public Items;
    mapping(address => string[]) public userItems;

    uint256 invalidIndex =
        115792089237316195423570985008687907853269984665640564039457584007913129639935;

    // METHODS
    constructor(uint256 _marketFeePercentage) {
        // so the marketFee percentage will be deducted from the selling price of the item
        // currently set to 2%
        marketFeePercentage = _marketFeePercentage / 100;
    }

    function AddNewItem(
        string memory _id,
        string memory _name,
        string memory _description,
        string memory _image,
        string memory _location,
        uint256 _price
    ) external nonReentrant {
        require(Items[_id].owner == address(0), "Item Already EXISTS");

        itemCount++;

        Item storage _Item = Items[_id];
        _Item.id = _id;
        _Item.name = _name;
        _Item.description = _description;
        _Item.image = _image;
        _Item.location = _location;
        _Item.price = _price;
        _Item.isItemListed = true;
        _Item.owner = msg.sender;

        emit ItemCreated(_id, msg.sender, _name, _price);

        listItem(_id);
    }

    function buyItems(string memory _itemId) external payable nonReentrant {
        Item memory _Item = Items[_itemId];

        //run checks
        require(
            keccak256(bytes(_Item.id)) == keccak256(bytes(_itemId)),
            "Item not found"
        );

        require(
            _Item.price == msg.value,
            "Attached deposit should be equal to the item's price"
        );

        // get fee from attached deposit and transfer accordingly
        uint256 fee = msg.value * marketFeePercentage;
        uint256 remaining = msg.value - fee;

        (bool sentRemaining, ) = _Item.owner.call{value: remaining}("");
        require(sentRemaining, "Failed to send Celo to item owner");

        (bool sentFee, ) = owner().call{value: fee}("");
        require(sentFee, "Failed to send Celo to contract owner");

        //remove item from current owner
        removeItem(_itemId, _Item.owner);
        // add item to buyer
        userItems[msg.sender].push(_itemId);

        emit ItemSold(msg.sender, _Item.name, _Item.id, _Item.price);
    }

    function relistItem(
        string memory _itemId,
        string memory _newLocation,
        uint256 _price
    ) external nonReentrant {
        // get item from storage
        Item storage _Item = Items[_itemId];

        //run checks
        require(
            keccak256(bytes(Items[_itemId].id)) == keccak256(bytes(_itemId)),
            "Item not found"
        );
        require(_Item.owner == msg.sender, "Only item owner can list item");
        require(!Items[_itemId].isItemListed, "Item already listed");

        //update location, price and listed parameter
        _Item.location = _newLocation;
        _Item.price = _price;
        _Item.isItemListed = true;

        // add listing
        listItem(_itemId);

        emit ItemRelisted(msg.sender, _Item.name, _Item.id, _Item.price);
    }

    function unlistItem(string memory _itemId) external nonReentrant {
        // get item from storage
        Item storage _Item = Items[_itemId];

        //run checks
        require(
            keccak256(bytes(Items[_itemId].id)) == keccak256(bytes(_itemId)),
            "Item not found"
        );
        require(_Item.owner == msg.sender, "Only item owner can unlist item");
        require(Items[_itemId].isItemListed, "Item is not listed");

        //update location, price and listed parameter
        _Item.isItemListed = false;

        //add new transaction history
        newHistory(_itemId, Type.REMOVE);
        emit ItemRemoved(msg.sender, _Item.name, _Item.id);
    }

    function updateMarketFeePercentage(uint256 newPercentage)
        external
        nonReentrant
        onlyOwner
    {
        marketFeePercentage = newPercentage / 100;
        emit NewMarketFee(msg.sender, newPercentage);
    }

    // Internal Functions

    function listItem(string memory _itemId) internal {
        // find item
        uint256 itemIndex = findItem(_itemId, msg.sender);

        // check if is item index is invalid
        if (itemIndex == invalidIndex) {
            userItems[msg.sender].push(_itemId);
        }

        //add new transaction history
        newHistory(_itemId, Type.ADD);
    }

    function removeItem(string memory _itemId, address _user) internal {
        uint256 index = findItem(_itemId, _user);
        require(index <= userItems[_user].length, "invalid index");

        for (uint256 i = index; i < userItems[_user].length - 1; i++) {
            userItems[msg.sender][i] = userItems[_user][i + 1];
        }
        userItems[msg.sender].pop();
    }

    function findItem(string memory _itemId, address _user)
        internal
        view
        returns (uint256)
    {
        int256 index = -1;

        for (int256 i = 0; i < int256(userItems[_user].length); i++) {
            if (
                keccak256(bytes(_itemId)) !=
                keccak256(bytes(userItems[_user][uint256(i)]))
            ) {
                continue;
            }
            index = i;
        }
        return uint256(index);
    }

    function newHistory(string memory _itemId, Type _tranType) internal {
        Item storage _Item = Items[_itemId];
        uint256 id = _Item.history.length;

        uint256 price;

        if (_tranType == Type.REMOVE) {
            price = 0;
        } else {
            price = _Item.price;
        }

        _Item.history.push(
            Transaction({
                id: id,
                tranType: _tranType,
                from: msg.sender,
                price: price,
                createdAt: block.timestamp
            })
        );
    }

    // View Methods
    function getItems(string memory _itemId)
        external
        view
        returns (Item memory)
    {
        return Items[_itemId];
    }

    function getItemCounts() external view returns (uint256) {
        return itemCount;
    }

    function getUserItems(address _user)
        external
        view
        returns (string[] memory)
    {
        return userItems[_user];
    }

    function getMarketFee() external view returns (uint256) {
        return marketFeePercentage;
    }
}
