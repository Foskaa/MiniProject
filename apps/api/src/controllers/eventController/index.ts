import { prisma } from "@/connection";
import fs from 'fs'
import { NextFunction, Request, Response } from "express";
import { addHours } from "date-fns";
import { cloudinaryUpload } from "@/utils/cloudinary";
import { Prisma } from "@prisma/client";
import { createEventService, findEventDetailService } from "@/services/event.service";


export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const imagesUpload: any = req.files;
        const { eventName, location, description, isPaid, locationUrl, startEvent, endEvent, categoryId, userId, tickets } = req.body
        const dataArrayTikcet = JSON.parse(tickets)

        await createEventService({
            eventName,
            location,
            locationUrl,
            description,
            isPaid,
            startEvent,
            endEvent,
            userId,
            categoryId,
            imagesUpload,
            dataArrayTikcet
        })
        // await prisma.$transaction(async (tx: any) => {
        //     const event = await tx.event.create({
        //         data: {
        //             eventName,
        //             location,
        //             locationUrl,
        //             description,
        //             isPaid: Boolean(isPaid),
        //             startEvent: addHours(new Date(startEvent), 7),
        //             endEvent: addHours(new Date(endEvent), 7),
        //             eventOrganizerId: userId,
        //             categoryId: Number(categoryId)
        //         }
        //     })

        //     const imagesArr = await Promise.all(imagesUpload?.images?.map(async (item: any) => {
        //         const result: any = await cloudinaryUpload(item?.buffer)

        //         return {
        //             eventImageUrl: result?.res,
        //             eventsId: event?.id
        //         }
        //     }))

        //     await tx.eventImages.createMany({
        //         data: imagesArr
        //     })

        //     if (dataArrayTikcet.length == 0) throw { msg: 'tiket wajib diisi', status: 400 }
        //     const dataTicket = dataArrayTikcet?.map((tik: any) => {
        //         return {
        //             price: Number(tik?.price),
        //             ticketName: tik?.ticketName,
        //             ticketType: tik?.ticketType,
        //             totalSeat: Number(tik?.seatAvailable),
        //             seatAvailable: Number(tik?.seatAvailable),
        //             eventId: Number(event?.id),
        //             discount: Number(tik?.discount),
        //             startDate: addHours(new Date(tik?.startDate), 7),
        //             endDate: addHours(new Date(tik?.endDate), 7),
        //         }
        //     })

        //     await tx.tickets.createMany({
        //         data: dataTicket
        //     })
        // })

        res.status(201).json({
            error: false,
            message: `Event ${eventName} berhasil ditambahkan!`,
            data: {}
        })

    } catch (error) {
        next(error)
    }
}

export const findEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { event,
            page = '1',
            limit_data = '8',
            category,
            minPrice,
            maxPrice,
            location,
            dateFrom,
            dateUntil,
        } = req.query;

        const offset = Number(limit_data) * (Number(page) - 1);
        const whereConditions = {
            AND: [
                event ? {
                    OR: [
                        { eventName: { contains: event as string, mode: 'insensitive' as Prisma.QueryMode } },
                        { location: { contains: event as string, mode: 'insensitive' as Prisma.QueryMode } },
                    ]
                } : {},

                category ? { categoryId: Number(category) } : {},

                (minPrice !== undefined && !isNaN(Number(minPrice))) ? {
                    tickets: {
                        some: {
                            price: { gte: Number(minPrice) }
                        }
                    }
                } : {},

                (maxPrice !== undefined && !isNaN(Number(maxPrice))) ? {
                    tickets: {
                        some: {
                            price: { lte: Number(maxPrice) }
                        }
                    }
                } : {},

                location ? { location: { contains: location as string } } : {},
                dateFrom ? { startEvent: { gte: new Date(dateFrom as string) } } : {},

                dateUntil ? { endEvent: { lte: new Date(dateUntil as string) } } : {},
            ].filter(item => Object.keys(item).length)
        };

        const eventSearch = await prisma.event.findMany({
            where: whereConditions,
            include: {
                EventImages: true,
                tickets: true,
                category: true
            },
            take: Number(limit_data),
            skip: offset
        });


        const eventDataWithDetails = eventSearch.map(event => {
            let minPriceForEvent: number | null = null;
            event.tickets.forEach(ticket => {
                if (minPriceForEvent === null || ticket.price < minPriceForEvent) {
                    minPriceForEvent = ticket.price;
                }
            });

            let totalSeatsAvailable = 0;
            event.tickets.forEach(ticket => {
                totalSeatsAvailable += ticket.seatAvailable;
            });

            return {
                ...event,
                minimumPrice: minPriceForEvent,
                seatAvailability: totalSeatsAvailable,
            };
        });



        const totalCount = await prisma.event.count({
            where: whereConditions
        });

        const totalPage = Math.ceil(Number(totalCount) / Number(limit_data));

        // if (eventSearch.length === 0 && event) {
        //     throw { msg: 'Event tidak tersedia', status: 404 };
        // }

        if (eventDataWithDetails.length === 0 && event) {
            throw { msg: 'Event tidak tersedia', status: 404 };
        }

        res.status(200).json({
            error: false,
            message: "Berhasil menampilkan data event!",
            data: {
                totalPage,
                eventSearch: eventDataWithDetails,
            }
        });

    } catch (error) {
        next(error);
    }
};

export const findEventDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const eventDetail = await findEventDetailService({ id })
        // await prisma.event.findMany({
        //     where: {
        //         id: Number(id)
        //     },
        //     include: {
        //         EventImages: true,
        //         tickets: true,
        //         category: true,
        //         EventOrganizer: true,
        //         Reviews: true
        //     }
        // })

        if (eventDetail.length == 0) throw { msg: "Event not found", status: 404 }

        res.status(200).json({
            error: false,
            message: "Event Detail berhasil didapatkan!",
            data: eventDetail
        })

    } catch (error) {
        next(error)
    }

}

export const getNewestEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchEventByStartEvent = await prisma.event.findMany({
            take: 10,
            orderBy: [{
                startEvent: 'asc'
            }],
            include: {
                EventImages: true,
                tickets: true
            }
        })

        const eventDataNewest = searchEventByStartEvent.map(event => {
            let minPriceForEvent: number | null = null;
            event.tickets.forEach(ticket => {
                if (minPriceForEvent === null || ticket.price < minPriceForEvent) {
                    minPriceForEvent = ticket.price;
                }
            });

            let totalSeatsAvailable = 0;
            event.tickets.forEach(ticket => {
                totalSeatsAvailable += ticket.seatAvailable;
            });

            return {
                ...event,
                minimumPrice: minPriceForEvent,
                seatAvailability: totalSeatsAvailable,
            };
        });


        if (!eventDataNewest.length) throw { msg: 'Data tidak ada', status: 404 }

        res.status(200).json({
            error: false,
            message: 'Berhasil menampilkan data event terbaru!',
            data: eventDataNewest
        })
    } catch (error) {
        next(error)
    }
}


export const getBestSellingEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactionQuantities = await prisma.transactionDetail.groupBy({
            by: ['ticketId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10,
        });

        const topEventIds = await prisma.tickets.findMany({
            where: {
                id: { in: transactionQuantities.map((t: any) => t.ticketId) },
            },
            select: { eventId: true },
        });

        const bestSellingEvents = await prisma.event.findMany({
            where: {
                id: { in: topEventIds.map((t: any) => t.eventId) },
            },
            include: {
                EventImages: true,
                tickets: true,
            },
        });

        const eventDataBestSelling = bestSellingEvents.map(event => {
            let minPriceForEvent: number | null = null;
            event.tickets.forEach(ticket => {
                if (minPriceForEvent === null || ticket.price < minPriceForEvent) {
                    minPriceForEvent = ticket.price;
                }
            });

            let totalSeatsAvailable = 0;
            event.tickets.forEach(ticket => {
                totalSeatsAvailable += ticket.seatAvailable;
            });

            return {
                ...event,
                minimumPrice: minPriceForEvent,
                seatAvailability: totalSeatsAvailable,
            };
        });

        if (!eventDataBestSelling.length) throw { msg: 'Data belum tersedia', status: 404 };

        res.status(200).json({
            error: false,
            message: 'Berhasil mendapatkan data event terlaris!',
            data: eventDataBestSelling,
        });
    } catch (error) {
        next(error);
    }
}

export const getComedyEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchEventByCategory = await prisma.event.findMany({
            take: 4,
            where: { categoryId: 4 },
            include: {
                EventImages: true,
                tickets: true
            }
        })

        const eventDataComedy = searchEventByCategory.map(event => {
            let minPriceForEvent: number | null = null;
            event.tickets.forEach(ticket => {
                if (minPriceForEvent === null || ticket.price < minPriceForEvent) {
                    minPriceForEvent = ticket.price;
                }
            });

            let totalSeatsAvailable = 0;
            event.tickets.forEach(ticket => {
                totalSeatsAvailable += ticket.seatAvailable;
            });

            return {
                ...event,
                minimumPrice: minPriceForEvent,
                seatAvailability: totalSeatsAvailable,
            };
        });

        if (!eventDataComedy.length) throw { msg: 'Data tidak ada', status: 404 }

        res.status(200).json({
            error: false,
            message: 'Berhasil mendapatkan data event berkategori komedi!',
            data: eventDataComedy
        })

    } catch (error) {
        next(error)
    }
}


export const getCarousel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataImage = await prisma.eventImages.findMany({
            take: 6,
            include: {
                Events: true
            }
        })

        res.status(200).json({
            error: false,
            message: 'Berhasil mendapatkan data carousel!',
            data: dataImage,
        })
    } catch (error) {
        next(error)
    }
}

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const imagesUploaded: any = req?.files
        const { eventName, location, description, isPaid, locationUrl, startEvent, endEvent, categoryId, userId } = req.body
        const { id } = req.params

        await prisma.$transaction(async (tx: any) => {
            const findUser = await tx.event.findMany({
                where: { eventOrganizerId: userId }
            })

            if (findUser.length == 0) throw { msg: 'Data tidak tersedia', status: 404 }

            const updatedEvent = await tx.event.update({
                data: {
                    eventName,
                    location,
                    locationUrl,
                    description,
                    isPaid: Boolean(isPaid),
                    startEvent: new Date(startEvent),
                    endEvent: new Date(endEvent),
                    categoryId: Number(categoryId),
                    eventOrganizerId: userId
                },
                where: { id: Number(id) }
            })

            const findEvent = await tx.event.findFirst({
                where: { id: Number(id) },
                include: {
                    EventImages: true,
                }
            })

            await prisma.eventImages.deleteMany({
                where: { eventsId: findEvent?.id }
            })

            // const imagesArr = imagesUploaded?.images?.map((item: any) => {
            //     return {
            //         eventImageUrl: item.filename,
            //         eventsId: updatedEvent.id
            //     }
            // })

            const imagesArr = await Promise.all(imagesUploaded?.images?.map(async (item: any) => {
                const result: any = await cloudinaryUpload(item?.buffer)

                return {
                    eventImageUrl: result?.res,
                    eventsId: updatedEvent?.id
                }
            }))

            await tx.eventImages.createMany({
                data: imagesArr
            })


            findEvent?.EventImages?.forEach((item: any) => {
                fs.rmSync(`/src/public/images/${item.eventImageUrl}`)
            })
        })

        res.status(200).json({
            error: false,
            message: 'Berhasil merubah data event!',
            data: {}
        })

    } catch (error) {
        next(error)
    }
}






export const getOrganizerEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body
        const {
            page = '1',
            limit_data = '8',
            search = '',
        } = req.query;

        const offset = Number(limit_data) * (Number(page) - 1);

        const filters: any = {
            eventOrganizerId: userId,
        };

        if (search) {
            filters.OR = [
                { eventName: { contains: search as string, mode: 'insensitive' } }, // Adjust field name if necessary
                { location: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const eventList = await prisma.event.findMany({
            where: filters,
            include: {
                EventImages: true,
                tickets: true,
                category: true,
                EventOrganizer: true,
            },
            skip: offset,
            take: Number(limit_data),
        });

        const totalCount = await prisma.event.count({ where: filters });
        const totalPage = Math.ceil(totalCount / Number(limit_data));



        res.status(200).json({
            error: false,
            message: "Event berdasarkan data event organizer berhasil ditambahkan!",
            data: eventList.length === 0 ? {} : { eventList, totalPage }
        })
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { userId } = req.body

        await prisma.$transaction(async (tx: any) => {
            const findImage = await tx.eventImages.findMany({
                where: { eventsId: Number(id) }
            })

            await tx.tickets.deleteMany({
                where: {
                    eventId: Number(id)
                }
            })

            await tx.eventImages.deleteMany({
                where: { eventsId: Number(id) },
            });

            await tx.event.delete({
                where: {
                    id: Number(id),
                    eventOrganizerId: userId
                },
            });
        })

        res.status(200).json({
            error: false,
            message: "Data Berhasil Dihapus!",
            data: {}
        })
    } catch (error) {
        next(error)
    }

};
