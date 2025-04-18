import axios from "axios";
import { config } from "../scripts/config";

const dominio = config.back_end.dominio;

export const getArtistArray = async () => {
	const array = await axios.get(`${dominio}/artists`);
	return array?.data;
};

export const getSongsArray = async () => {
	const array = await axios.get(`${dominio}/songs`);
	return array?.data;
};

export const getArtistById = async (id) => {
	const artist = await axios.get(`${dominio}/artist_id/${id}`);
	return artist?.data;
};

export const getArtistByName = async (name) => {
	const artist = await axios.get(`${dominio}/artist_name/${name}`);
	return artist?.data;
};

export const getSongById = async (id) => {
	const song = await axios.get(`${dominio}/song_id/${id}`);
	return song?.data;
};

export const getSongsByArtistId = async (id) => {
	const artist = await axios.get(`${dominio}/songs_artist_id/${id}`);
	return artist?.data;
};

export const getSongsByArtistName = async (name) => {
	const artist = await axios.get(`${dominio}/songs_artist_name/${name}`);
	return artist?.data;
};

export const getSongAndArtistBySongId = async (id) => {
	const song_artist = await axios.get(`${dominio}/song_artist_by_song_id/${id}`);
	return song_artist?.data;
};
