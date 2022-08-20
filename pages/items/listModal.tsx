import React, { useState } from "react";
import { Input, Modal, Button } from "components";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { relistItem } from "lib/market";
import { Contract } from "web3-eth-contract";
import { useWeb3 } from "lib/web3"


function ListItemModal({ id, marketContract, handleClose, update }: { update: Function, handleClose: Function, id: string, marketContract: Contract }) {
    const { account } = useWeb3();
    const { register, handleSubmit } = useForm<any>({ defaultValues: { duration: "86400", type: "0" } });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleCreate(params) {
        try {
            setLoading(true)
            await relistItem(id, params.price, params.location, marketContract, account)
            toast.success('Item relisted')
        } catch (e) {
            console.log({ e });
            toast.error("Failed to list item");
        } finally {
            setLoading(false);
            handleClose();
            update();
        }
    }

    return (
        <Modal onClose={handleClose}>

            <div className="container my-12">
                <div className="max-w-lg mx-auto bg-gray-900 rounded-sm p-8">
                    <h1 className="text-3xl font-semibold text-red-500">List Item</h1>
                    <p>
                        List Item listing using this form.
                    </p>
                    <hr className="my-8" />
                    <form onSubmit={handleSubmit(handleCreate)}>
                        <div className="space-y-6">
                            <div>
                                <Input
                                    type="text"
                                    label="Location"
                                    {...register('location', { required: true })}
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    step={0.01}
                                    label="Listing Price (in cUSD)"
                                    {...register('price', { required: true })}
                                />
                            </div>
                            <Button type="submit" loading={loading}>
                                List Item
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    )
}

export default ListItemModal;