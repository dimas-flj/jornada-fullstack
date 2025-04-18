import { artistArray } from "../../front-end/src/assets/database/artists.js";
import { songsArray } from "../../front-end/src/assets/database/songs.js";
import { songsArray2 } from "../../front-end/src/assets/database/songs.js";

import { db } from "./connectDB.js";

const newArtistArray = artistArray.map((currentArtistArrayObj) => {
	const newArtistArrayObj = { ...currentArtistArrayObj };
	delete newArtistArrayObj.id;

	return newArtistArrayObj;
});

const newSongsArray = songsArray.map((currentSongsArrayObj) => {
	const newSongsArrayObj = { ...currentSongsArrayObj };
	delete newSongsArrayObj.id;

	return newSongsArrayObj;
});

const newSongsArray2 = songsArray2.map((currentSongsArrayObj) => {
	const newSongsArrayObj = { ...currentSongsArrayObj };
	delete newSongsArrayObj.id;

	return newSongsArrayObj;
});

// const responseArtists = await db
// 	.collection("artists")
// 	.insertMany(newArtistArray);
// console.log(responseArtists);

// const responseSongs = await db.collection("songs").insertMany(newSongsArray);
// console.log(responseSongs);

const responseSongs = await db.collection("songs").insertMany(newSongsArray2);
console.log(responseSongs);
