/*
my IP: 177.24.46.212

ACESSO DO MEU USUARIO NO SITE DO MONGODB
db: spotify
user: dimasflj
pwd: QI6OCrqzT2ACWrcF

CONNECTION STRING
mongodb+srv://dimasflj:QI6OCrqzT2ACWrcF@cluster0.zdmqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
*/

import { MongoClient } from "mongodb";

const URI =
	"mongodb+srv://dimasflj:QI6OCrqzT2ACWrcF@cluster0.zdmqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(URI, {
	connectTimeoutMS: 30000, // 30 seconds timeout
});

export const db = client.db("spotifyAula");

// const songsCollection = await db.collection("songs").find({}).toArray();

// console.log(songsCollection);
