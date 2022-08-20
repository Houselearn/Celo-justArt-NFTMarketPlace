import { Button, Input, Layout, Select } from "components";
import { useWeb3 } from "lib/web3";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { addNewItem } from "../lib/market"
import { useMarketContract } from "lib/contracts";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Item } from "lib/interfaces";

function Create() {
  const { account, connect } = useWeb3();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm<any>({ defaultValues: { duration: "86400", type: "0" } });
  const marketContract = useMarketContract();

  async function handleCreate(params) {
    let id: string = "/"
    if (marketContract === null) {
      return
    }
    if (!account) {
      await connect();
    }
    try {
      setLoading(true)
      const item: Item = {
        name: params.name,
        description: params.description,
        image: params.image,
        location: params.location,
        price: params.price
      }
      id = await addNewItem(item, marketContract, account);
      toast.success('Listing created')
      router.push(`/items/${id}`);
    } catch (e) {
      console.log({ e });
      toast.error("Failed to create a product.");
    } finally {
      setLoading(false)
    }
  }

  const buttonLabel = !account ? 'Connect Wallet' : 'Create Listing';

  return (
    <Layout>
      <div className="container my-12">
        <div className="max-w-lg mx-auto bg-gray-900 rounded-sm p-8">
          <h1 className="text-3xl font-semibold text-red-500">Create Listing</h1>
          <p>
            Create a New Item listing using this form.
          </p>
          <hr className="my-8" />
          <form onSubmit={handleSubmit(handleCreate)}>
            <div className="space-y-6">
              <div>
                <Input
                  label="Item Name"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <Input
                  label="Item Description"
                  {...register('description', { required: true })}
                />
              </div>
              <div>
                <Input
                  label="Item Image URL"
                  {...register('image', { required: true })}
                />
              </div>
              <div>
                <Input

                  label="Item Location"
                  {...register('location', { required: true })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  step={0.01}
                  label="Price (in cUSD)"
                  {...register('price', { required: true })}
                />
              </div>
              <Button type="submit" loading={loading}>
                {buttonLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default Create;