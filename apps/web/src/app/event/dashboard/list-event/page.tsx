// components/EventTable.tsx
'use client'
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance/axiosInstance';
import { useDebouncedCallback } from 'use-debounce';
import { FaRegTrashAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaRegEye } from "react-icons/fa6";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link'



interface EventData {
    id: Number;
    eventName: string;
    category: {
        Category: string;
    }
    startEvent: string;
    endEvent: string;
    isPaid: string;
};


export default function EventTable() {
    const router = useRouter();
    const searchParams = useSearchParams()
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const params = new URLSearchParams(searchParams)
    const [searchInput, setSearchInput] = useState(params.get('search') || '');
    const [page, setPage] = useState(Number(params.get('page')) || 1);
    // 



    const { data: getEventList, refetch } = useQuery({
        queryKey: ['get-event-list', searchInput, page],
        queryFn: async () => {
            const res = await instance.get(`/event/organizer-event`, {
                params: { page, limit_data: 8, search: searchInput }
            });
            console.log(res.data.data)
            return res.data.data;
        },
    });

    const { mutate: mutateDeleteData } = useMutation({
        mutationFn: async (id: any) => {
            await instance.delete(`/event/delete-event/${id}`)
        },
        onSuccess: () => {
            refetch()
        }, 
        onError: (err) => {
            console.log(err)
        }
    });


    const debounceSearch = useDebouncedCallback((values) => {

        setSearchInput(values);
        setPage(1)

    }, 500);

    useEffect(() => {
        const currentUrl = new URLSearchParams(searchParams);
        currentUrl.set('page', page.toString());

        if (searchInput) {
            currentUrl.set('search', searchInput);
        } else {
            currentUrl.delete('search'); // Remove the search param if it's empty
        }
        router.push(`${pathname}?${currentUrl.toString()}`)
    }, [page, searchInput])

    return (
        <main className="flex flex-col h-fit w-full px-8 space-y-10 p-10">
            <div className='flex justify-between w-full items-center'>
                <h1 className="text-lg font-bold">Event List</h1>

                <div className='flex justify-end gap-8'>
                    <button className='px-4 font-bold text-white drop-shadow-lg bg-blue-500 rounded-lg hover:bg-blue-700 transition-all duration-300'>
                        + Buat Event
                    </button>
                    <Avatar className='border-blue-400 border-2 hover:border-yellow-500 transition-all duration-300'>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <input
                type="text"
                placeholder="Search events..."
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                onChange={(e) => debounceSearch(e.target.value)}
            />
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">No</th>
                            <th className="py-3 px-6 text-left">Event Name</th>
                            <th className="py-3 px-6 text-left">Category</th>
                            <th className="py-3 px-6 text-left">Start Date</th>
                            <th className="py-3 px-6 text-left">End Date</th>
                            <th className="py-3 px-6 text-left">Is Paid</th>
                            <th className="py-3 px-6 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {getEventList && getEventList?.eventList?.map((item: EventData, index: number) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{index + 1}</td>
                                <td className="py-3 px-6 text-left whitespace-nowrap">{item?.eventName}</td>
                                <td className="py-3 px-6 text-left">{item?.category?.Category!}</td>
                                <td className="py-3 px-6 text-left">{item?.startEvent.split('T')[0]}</td>
                                <td className="py-3 px-6 text-left">{item?.endEvent.split('T')[0]}</td>
                                <td className="py-3 px-6 text-left">{item?.isPaid.toString()}</td>
                                <td className="py-3 px-6 text-left space-x-1">
                                    <button className='bg-green-600 p-2 rounded-md'><FaRegEye color='white' /></button>

                                    <AlertDialog>
                                        <AlertDialogTrigger>
                                            <button className='bg-red-600 p-2 rounded-md'><FaRegTrashAlt color='white' /></button>                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Peringatan</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin menghapus item ini?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => mutateDeleteData(item?.id)}
                                                >

                                                    Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Link href={`/event/dashboard/u/${item?.id}`}>
                                        <button className='bg-yellow-500 p-2 rounded-md'><FaPencil color='white' /></button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {Array(getEventList?.totalPage).fill(0).map((item, index) => {
                return (
                    <button
                        key={index}
                        className="join-item btn btn-sm mx-2 border rounded-lg w-10 h-10 hover:bg-slate-400  hover:font-bold transition-all active:bg-yellow-500  focus:ring focus:bg-blue-950 focus:text-white duration-300 ease-in-out "
                        onClick={() => setPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                )
            })}
        </main >
    )
}
