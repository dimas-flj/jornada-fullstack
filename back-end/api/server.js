import express from "express";
import { db } from "./connectDB.js";
import cors from "cors";
import { ObjectId } from "mongodb";

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/", (request, response) => {
	response.send("{'nome': 'eu de novo'}");
});

app.get("/artists", async (request, response) => {
	response.contentType("application/json");
	try {
		response.send(await db.collection("artists").find({}).toArray());
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error.message,
		});
	}
});

app.get("/songs", async (request, response) => {
	response.contentType("application/json");

	try {
		response.send(await db.collection("songs").find({}).toArray());
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error.message,
		});
	}
});

app.get("/artist_id/:id", async (request, response) => {
	response.contentType("application/json");

	const { id } = request.params;
	if (id === "undefined" || id === null) {
		response.send({ err: "true", msg: "ID undefined." });
		return;
	}

	try {
		const artist = await db
			.collection("artists")
			.findOne({ _id: new ObjectId(id) });

		if (artist === null) {
			response.send({
				err: "true",
				name: "Internal Server Error.",
				message: `Artist not found with id ${id}`,
			});
		} else {
			response.send(artist);
		}
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error.message,
		});
	}
});

app.get("/artist_name/:name", async (request, response) => {
	response.contentType("application/json");

	const { name } = request.params;
	if (name === "undefined" || name === null) {
		response.send({ error: "true", msg: "Name undefined." });
		return;
	}

	try {
		const artist = await db.collection("artists").findOne({ name: name });

		if (artist === null) {
			response.send({
				err: "true",
				name: "Internal Server Error.",
				message: `Artist not found with name ${name}`,
			});
		} else {
			response.send(artist);
		}
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error.message,
		});
	}
});

app.get("/song_id/:id", async (request, response) => {
	response.contentType("application/json");

	const { id } = request.params;
	if (id === "undefined" || id === null) {
		response.send({ error: "true", msg: "ID undefined." });
		return;
	}

	try {
		const song = await db
			.collection("songs")
			.findOne({ _id: new ObjectId(id) });

		if (song === null) {
			response.send({
				err: "true",
				name: "Internal Server Error.",
				message: `Song not found with id ${id}`,
			});
		} else {
			response.send(song);
		}
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error.message,
		});
	}
});

app.get("/songs_artist_id/:id", async (request, response) => {
	response.contentType("application/json");

	const { id } = request.params;
	if (id === "undefined" || id === null) {
		response.send({ error: "true", msg: "Name undefined." });
		return;
	}

	try {
		const artist = await db
			.collection("artists")
			.aggregate([
				{
					$match: {
						_id: ObjectId.createFromHexString(id),
					},
				},
				{
					$lookup: {
						from: "songs",
						localField: "name",
						foreignField: "artist",
						as: "songs",
					},
				},
				{
					$match: {
						songs: {
							$ne: [],
						},
					},
				},
			])
			.toArray();

		if (artist === null) {
			response.send({
				err: "true",
				name: "Internal Server Error.",
				message: `Songs not found with id ${id}`,
			});
		} else {
			response.send(artist[0]);
		}
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error,
		});
	}
});

app.get("/songs_artist_name/:name", async (request, response) => {
	response.contentType("application/json");

	const { name } = request.params;
	if (name === "undefined" || name === null) {
		response.send({ error: "true", msg: "Name undefined." });
		return;
	}

	try {
		const artist = await db
			.collection("artists")
			.aggregate([
				{
					$match: {
						name: name,
					},
				},
				{
					$lookup: {
						from: "songs",
						localField: "name",
						foreignField: "artist",
						as: "songs",
					},
				},
				{
					$match: {
						songs: {
							$ne: [],
						},
					},
				},
			])
			.toArray();

		if (artist === null) {
			response.send({
				err: "true",
				name: "Internal Server Error.",
				message: `Songs not found with name ${name}`,
			});
		} else {
			response.send(artist[0]);
		}
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error,
		});
	}
});

app.get("/song_artist_by_song_id/:id", async (request, response) => {
	response.contentType("application/json");

	const { id } = request.params;
	if (id === "undefined" || id === null) {
		response.send({ error: "true", msg: "Name undefined." });
		return;
	}

	try {
		const song_artist = await db
			.collection("songs")
			.aggregate([
				{
					$match: {
						_id: ObjectId.createFromHexString(id),
					},
				},
				{
					$lookup: {
						from: "artists",
						localField: "artist",
						foreignField: "name",
						as: "artist_obj",
					},
				},
				{
					$match: {
						artist_obj: {
							$ne: [],
						},
					},
				},
			])
			.toArray();

		if (song_artist === null) {
			response.send({
				err: "true",
				name: "Internal Server Error.",
				message: `Songs and Artist not found with song id ${id}`,
			});
		} else {
			response.send(song_artist[0]);
		}
	} catch (error) {
		response.send({
			err: "true",
			name: error.message,
			message: error,
		});
	}
});

app.listen(PORT, () => {
	console.log(`Servidor esta escutando na port ${PORT}`);
});
