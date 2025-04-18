import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { Link, useParams } from "react-router-dom";
import SongList from "../components/SongList";
import { getSongsByArtistId } from "../scripts/api.js";
import { useEffect, useRef, useState } from "react";

const Artist = () => {
	const [songs, setSongs] = useState([]);
	const [artist, setArtist] = useState({});
	const randomIdFromArtist = useRef(0);
	const { id } = useParams();

	useEffect(() => {
		const artist_songs = getSongsByArtistId(id);

		artist_songs.then((artistObj) => {
			const local_artist = artistObj;
			setArtist(local_artist);

			const songs_array = local_artist.songs;
			setSongs(songs_array);

			const randomIndex = Math.floor(Math.random() * (songs_array.length - 1));
			randomIdFromArtist.current = songs_array[randomIndex]._id;
		});
	}, [id, songs]);

	return (
		<div className="artist">
			<div
				className="artist__header"
				style={{
					backgroundImage: `linear-gradient(to bottom, var(--_shade), var(--_shade)), url(${artist.banner})`,
				}}
			></div>
			<h2 className="artist__title">{artist.name}</h2>
			<div className="artist__body">
				<h2>Populares</h2>
				<SongList songsArray={songs} />
			</div>
			<Link to={`/song/${randomIdFromArtist.current}`}>
				<FontAwesomeIcon className="single-item__icon single-item__icon--artist" icon={faCirclePlay} />
			</Link>
		</div>
	);
};

export default Artist;
