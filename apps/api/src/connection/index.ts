import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

export const prisma = new PrismaClient

export const mysqlConnection = async () => {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Maximum57!',
        database: 'db_tiket',
    });

    return connection;
};