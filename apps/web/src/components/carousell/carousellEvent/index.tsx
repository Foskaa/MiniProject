import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { IoLocationSharp } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';
import Autoplay from "embla-carousel-autoplay"
import { useRef } from 'react';
import { useEffect } from 'react';
import EmblaCarousel from 'embla-carousel';
import { EmblaCarouselType } from 'embla-carousel';


export default function CarousellEvent({ data }: { data: any[] }) {
    const emblaRef = useRef<HTMLDivElement>(null); // Ref for the carousel container div
    const emblaInstance = useRef<EmblaCarouselType | null>(null); // Ref for the EmblaCarousel instance

    useEffect(() => {
        if (emblaRef.current && !emblaInstance.current) {
            emblaInstance.current = EmblaCarousel(emblaRef.current, {
                loop: true,
            }, [
                Autoplay({
                    delay: 2000,
                }),
            ]);
        }

        return () => {
            // Only try to destroy the instance if it's defined
            if (emblaInstance.current) {
                emblaInstance.current.destroy();
                emblaInstance.current = null;
            }
        };
    }, []);

    return (
        <Carousel
            className="w-full"
            ref={emblaRef}
        >
            <CarouselContent>
                {data?.map((item: any, index: any) => (
                    <CarouselItem key={index} className=" basis-1/2 lg:basis-1/4">
                        <div className="p-1">
                            <Card className="h-[250px] lg:h-fit pb-2 rounded-2xl">
                                <Link href={`/event/explore/${item.id}TBX${item.startEvent.split('T')[0].split('-').join('')} ${item.eventName.toLowerCase()}`}>
                                    <CardContent className="flex items-center justify-center">
                                        <div className='w-full lg:h-44'>
                                            <Image
                                                src={
                                                    item?.EventImages[0]?.eventImageUrl?.includes('https://')
                                                    ? item.EventImages[0].eventImageUrl
                                                    : `http://localhost:8000/api/src/public/images/${item.EventImages[0]?.eventImageUrl || 'default-image.png'}`
                                                }
                                                height={142}
                                                width={142}
                                                alt="testing"
                                                className="w-full lg:h-44 object-cover rounded-t-2xl"
                                            />
                                        </div>
                                    </CardContent>
                                    <div className='text-black p-2 pt-5'>
                                        <div className='flex flex-col gap-2'>
                                            <h1 className='flex items-center gap-2 text-xs lg:text-sm text-gray-500 font-normal'>
                                                <IoLocationSharp />{item?.location.length > 20 ? <h1>{item?.location.slice(0, 20)}</h1> : item?.location}</h1>
                                            <h1 className='flex items-center gap-2 text-xs lg:text-sm text-gray-500 font-normal'>
                                                <FaCalendarAlt />
                                                {item?.startEvent.split('T')[0].split('-').join('/')} - {item?.endEvent.split('T')[0].split('-').join('/')}
                                            </h1>
                                        </div>
                                        <h1 className='text-black text-sm lg:text-base mt-2 font-bold'>{item?.eventName.length > 30 ? <h1>{item?.eventName.slice(0, 30)}...</h1> : item?.eventName}</h1>
                                        <h1 className='text-xs lg:text-sm  mt-2 bottom-0 text-gray-500 font-normal'>Mulai dari </h1>
                                        <div className=' flex justify-between'>
                                            <h1 className='text-sm lg:text-base   bottom-0 text-orange-600 font-bold'> RP. {item?.tickets[0]?.price}</h1>
                                            <h1 className='text-xs lg:text-sm   bottom-0 text-green-500'> Tiket Tersedia</h1>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}

            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}