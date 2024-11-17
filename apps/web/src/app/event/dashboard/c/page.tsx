'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useMutation, useQuery } from '@tanstack/react-query';
import instance from '@/utils/axiosInstance/axiosInstance';
import { EventSchema } from '@/features/event/schema/eventSchemas';
import { MdOutlineAccessTimeFilled } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaRegTrashAlt } from "react-icons/fa";
import { RiInformation2Fill } from "react-icons/ri";
import { Tooltip } from 'react-tooltip';
import Image from 'next/image';
import CreateEventInfo from '@/components/eventDashboard/createEventInfo';
import ImageUpload from '@/components/eventDashboard/imageUpload';
import CreateTicket from '@/components/eventDashboard/createTicket';
import TicketList from '@/components/eventDashboard/ticketList';
import EditEventInfo from '@/features/eventDashboard/components/editEventInfo';
import ImageUploader from '@/features/eventDashboard/components/imageUploader';
import CreateNewTicket from '@/features/eventDashboard/components/createNewTicket';


const EventForm = () => {
  const { mutate: mutationCreateEvent } = useMutation({
    mutationFn: async (values: FormData) => {
      return await instance.post('/event/new-event', values);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message);
      console.log(res);
    },
    onError: (error) => {
      toast.error('Error');
      console.log(error);
    },
  });
  const { data: getCategory } = useQuery({
    queryKey: ['get-category'],
    queryFn: async () => {
      const res = await instance.get('/category');
      return res.data.data;
    },
  });


  const [isPaid, setIsPaid] = useState(true);

  return (
    <main className="bg-white p-5 px-1 lg:px-20">
      <Formik
        initialValues={{
          eventName: '',
          location: '',
          locationUrl: '',
          description: '',
          isPaid: true,
          startEvent: '',
          endEvent: '',
          categoryId: '',
          price: 0,
          ticketName: '',
          ticketType: '',
          seatAvailable: 0,
          discount: 0,
          startDate: '',
          endDate: '',
          tickets: [],
        }}

        validateOnChange={true}
        validateOnBlur={true}
        validationSchema={EventSchema}
        onSubmit={(values: any) => {
          const fd = new FormData();
          fd.append('eventName', values.eventName);
          fd.append('location', values.location);
          fd.append('locationUrl', values.locationUrl);
          fd.append('description', values.description);
          fd.append('isPaid', values.isPaid);
          fd.append('startEvent', values.startEvent);
          fd.append('endEvent', values.endEvent);
          fd.append('artist', values.artist);
          fd.append('categoryId', values.categoryId);

          const ticketsEvent = values?.tickets!.map(
            (ticket: any, index: any) => {
              return {
                price: Number(ticket.price),
                ticketName: ticket.ticketName,
                ticketType: ticket.ticketType,
                seatAvailable: Number(ticket.seatAvailable),
                version: ticket.version,
                discount: Number(ticket.discount),
                startDate: new Date(ticket.startDate),
                endDate: new Date(ticket.endDate),
              };
            },
          );

          fd.append(`tickets`, JSON.stringify(ticketsEvent));

          values.images.forEach((image: any, index: any) => {
            fd.append(`images`, image);
          });

          mutationCreateEvent(fd);
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="">
            <EditEventInfo
              getCategory={getCategory}
              setIsPaid={setIsPaid}
              setFieldValue={setFieldValue}
              values={values}
            />

            <ImageUploader
              setFieldValue={setFieldValue}
              values={values}
            />

            <CreateNewTicket
              isPaid={isPaid}
              setFieldValue={setFieldValue}
              values={values}
            />
            <div>
              <h3 className='flex justify-center font-bold text-2xl mt-8 pb-5 mb-4'>Daftar Tiket</h3>
              <TicketList
                setFieldValue={setFieldValue}
                values={values}
              />
            </div>
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="bg-blue-500 text-white rounded-md p-3"
              >
                Buat Event
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </main>
  );
};

export default EventForm;
