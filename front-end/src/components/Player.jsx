import {
	faCirclePlay,
	faCirclePause,
	faBackwardStep,
	faForwardStep,
	faBackward,
	faForward,
	faVolumeXmark,
	faVolumeHigh,
	faVolumeMedium,
	faVolumeLow,
} from "@fortawesome/free-solid-svg-icons";

import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getSongById, getSongsArray, getSongsByArtistName } from "../scripts/api.js";
import { formatTime } from "../scripts/util.js";
import { useNavigate } from "react-router-dom";
import InputRangeSong from "./InputRangeSong";

const LightTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.common.white,
		color: "rgba(0, 0, 0, 0.87)",
		boxShadow: theme.shadows[1],
		fontSize: 11,
		borderRadius: "10px",
		textAlign: "center",
	},
}));

const Player = ({ id, random }) => {
	const navigate = useNavigate();

	const [rangeAudioVolumeDisabled, setRangeAudioVolumeDisabled] = useState(false);
	const [rangeSoundBackgroundInput, serRangeSoundBackgroundInput] = useState();
	const [disableBackwardButton, setDisableBackwardButton] = useState(false);
	const [disableForwardButton, setDisableForwardButton] = useState(false);
	const [initTimeToggleVolume, setInitTimeToggleVolume] = useState(null);
	const [advanceTenSeconds, setAdvanceTenSeconds] = useState(false);
	const [goBackTenSeconds, setGoBackTenSeconds] = useState(false);
	const [randomIdBackward, setRandomIdBackward] = useState();
	const [rangeVolumeValue, setRangeVolumeValue] = useState(5);
	const [randomIdForward, setRandomIdForward] = useState();
	const [toolTipVolume, setToolTipVolume] = useState();
	const [currentTime, setCurrentTime] = useState(formatTime(0));
	const [iconVolume, setIconVolume] = useState(faVolumeXmark);
	const [backwardSongName, setBackwardSongName] = useState();
	const [forwardSongName, setForwardSongName] = useState();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [duration, setDuration] = useState(0);
	const [song, setSong] = useState({});

	const divRangeAudioVolumeVolume = useRef();
	const rangeAudioVolume = useRef();
	const tooltip = useRef();

	const changeIconVolume = useCallback((volume) => {
		if (volume === 0) {
			setIconVolume(faVolumeXmark);
		} else if (volume > 0 && volume <= 4) {
			setIconVolume(faVolumeLow);
		} else if (volume > 4 && volume <= 8) {
			setIconVolume(faVolumeMedium);
		} else if (volume > 8) {
			setIconVolume(faVolumeHigh);
		}

		setRangeVolumeThumbsPosition();
	}, []);

	const changeValueVolume = (e) => {
		const range = e.target;
		setRangeVolumeValue(Number(range.value));

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		serRangeSoundBackgroundInput(`linear-gradient(to right, silver 0%, silver ${value}%, rgb(119, 101, 101) ${value}%, rgb(119, 101, 101) 100%)`);
	};

	const setRangeVolumeThumbsPosition = () => {
		const range = rangeAudioVolume.current;
		const range_value = Number(range.value);
		const range_max = Number(range.max);
		const range_min = Number(range.min);

		let thumbSize = 8;
		const ratio = (range_value - range_min) / (range_max - range_min);
		let amountToMove = ratio * (range.offsetWidth - thumbSize - thumbSize) + thumbSize;
		tooltip.current.style.left = amountToMove + 25 + "px";

		const value = ((range.value - range.min) / (range.max - range.min)) * 100;
		serRangeSoundBackgroundInput(`linear-gradient(to right, silver 0%, silver ${value}%, rgb(119, 101, 101) ${value}%, rgb(119, 101, 101) 100%)`);
	};

	const stopRedirect = (paramId) => {
		const id = paramId || randomIdForward;
		setIsPlaying(false);
		navigate(random === undefined ? `/song/${id}` : `/song/${id}/true`);
	};

	const handleMutedVol = () => {
		setIsMuted(!isMuted);
		setRangeAudioVolumeDisabled(!rangeAudioVolumeDisabled);
	};

	const handleKeyDown = useCallback(
		(e) => {
			// e.keyCode === 107 (- key)
			// e.keyCode === 109 (+ key)
			if (e.keyCode === 107 || e.keyCode === 109) {
				setInitTimeToggleVolume(Date.now());

				let classList = divRangeAudioVolumeVolume.current.classList.toString();

				let isToggle = classList.indexOf("toggle") > -1;
				if (!isToggle) {
					divRangeAudioVolumeVolume.current.classList.toggle("toggle");
				}

				const range = rangeAudioVolume.current;
				let level = Number(range.value);
				if (e.keyCode === 107 && level < 10) {
					level++;
				}
				if (e.keyCode === 109 && level > 0) {
					level--;
				}
				setRangeVolumeValue(level);
				setTimeout(() => {
					classList = tooltip.current.classList + "";
					isToggle = classList.indexOf("toggle") > -1;
					if (!isToggle) {
						tooltip.current.classList.toggle("toggle");
					}
				}, 400);
			}
		},
		[tooltip, rangeAudioVolume, setInitTimeToggleVolume, divRangeAudioVolumeVolume]
	);

	// Handle Backward/Forward button
	useEffect(() => {
		getSongById(id).then((song) => {
			setSong(song);

			// Given that the test base contains repeated MP3 files, to ensure testing,
			// the audio URL needs a differential parameter
			if (song.audio !== null && song.audio !== undefined) {
				if (song.audio.endsWith(".mp3")) {
					song.audio = `${song.audio}?t=${Date.now()}`;
				} else {
					song.audio = `${song.audio}&t=${Date.now()}`;
				}
			}

			if (random === undefined) {
				getSongsArray().then((songsArray) => {
					let randomIndexBackward = Math.floor(Math.random() * (songsArray.length - 1));
					let randomIndexForward = Math.floor(Math.random() * (songsArray.length - 1));

					const idBackward = songsArray[randomIndexBackward]._id;
					setRandomIdBackward(idBackward);
					const songNameBackward = songsArray[randomIndexBackward].name;
					setBackwardSongName(songNameBackward);

					const idForward = songsArray[randomIndexForward]._id;
					setRandomIdForward(idForward);
					const songNameForward = songsArray[randomIndexForward].name;
					setBackwardSongName(songNameForward);
				});
			} else {
				getSongsByArtistName(song.artist).then((artist) => {
					const songsArray = artist.songs;

					const currentIndexFromIdSong = songsArray.map((elem) => elem._id).indexOf(id);

					let idBackward,
						idForward = null;

					// if is the first song on the list
					if (currentIndexFromIdSong == 0) {
						setDisableBackwardButton(true);
						setBackwardSongName("");

						const forwardSong = songsArray[currentIndexFromIdSong + 1];
						if (forwardSong !== undefined) {
							idForward = forwardSong._id;
							setForwardSongName(forwardSong.name);
							setDisableForwardButton(false);
						} else {
							setDisableForwardButton(true);
							setForwardSongName("");
						}
					}
					// if is the last song on the list
					else if (currentIndexFromIdSong === songsArray.length - 1) {
						setDisableForwardButton(true);
						setForwardSongName("");

						const backwardSong = songsArray[currentIndexFromIdSong - 1];
						if (backwardSong !== undefined) {
							idBackward = backwardSong._id;
							setBackwardSongName(backwardSong.name);
							setDisableBackwardButton(false);
						} else {
							setDisableBackwardButton(true);
							setBackwardSongName("");
						}
					} else {
						setDisableBackwardButton(false);
						setDisableForwardButton(false);

						const backwardSong = songsArray[currentIndexFromIdSong - 1];
						idBackward = backwardSong._id;
						setBackwardSongName(backwardSong.name);

						const forwardSong = songsArray[currentIndexFromIdSong + 1];
						idForward = forwardSong._id;
						setForwardSongName(forwardSong.name);
					}

					setRandomIdBackward(idBackward);
					setRandomIdForward(idForward);
				});
			}
		});
	}, [id, random]);

	// Handle keyboard events
	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown, false);

		return () => document.removeEventListener("keydown", handleKeyDown, false);
	}, [handleKeyDown]);

	// Handle current time
	useEffect(() => {
		const interval = setInterval(() => {
			// hide container audio volume
			if (initTimeToggleVolume != null && Date.now() - initTimeToggleVolume > 800) {
				divRangeAudioVolumeVolume.current.classList.toggle("toggle");
				tooltip.current.classList.toggle("toggle");
				setInitTimeToggleVolume(null);
			}
		}, 500);

		return () => clearInterval(interval);
	}, [isPlaying, initTimeToggleVolume]);

	// Handle input audio/range volume
	useEffect(() => {
		const range = rangeAudioVolume.current;
		if (isMuted) {
			setIconVolume(faVolumeXmark);
		} else {
			range.value = rangeVolumeValue;
			setToolTipVolume(rangeVolumeValue);
			changeIconVolume(rangeVolumeValue);
		}

		setRangeVolumeThumbsPosition();
	}, [changeIconVolume, initTimeToggleVolume, isMuted, rangeVolumeValue]);

	return (
		<div className="player">
			<div className="player__controllers">
				<LightTooltip title={backwardSongName} placement="top">
					<FontAwesomeIcon
						className={disableBackwardButton ? "player__icon_disabled" : "player__icon"}
						icon={faBackwardStep}
						onClick={(e) => (disableBackwardButton ? e.preventDefault() : stopRedirect(randomIdBackward))}
					/>
				</LightTooltip>

				<LightTooltip title="10 segundos" placement="top">
					<FontAwesomeIcon icon={faBackward} className="player__icon" onClick={() => setGoBackTenSeconds(true)} />
				</LightTooltip>

				<LightTooltip title="Executar/Parar" placement="top">
					<FontAwesomeIcon
						className="player__icon player__icon--play"
						icon={isPlaying ? faCirclePause : faCirclePlay}
						onClick={() => {
							setIsPlaying(!isPlaying);
						}}
					/>
				</LightTooltip>

				<LightTooltip title="10 segundos" placement="top">
					<FontAwesomeIcon icon={faForward} className="player__icon" id="forward_icon" onClick={() => setAdvanceTenSeconds(true)} />
				</LightTooltip>

				<LightTooltip title={forwardSongName} placement="top">
					<FontAwesomeIcon
						className={disableForwardButton ? "player__icon_disabled" : "player__icon"}
						icon={faForwardStep}
						onClick={(e) => (disableForwardButton ? e.preventDefault() : stopRedirect(randomIdForward))}
					/>
				</LightTooltip>
			</div>

			<div className="player__progress">
				<p>{currentTime}</p>
				<InputRangeSong
					songAudio={song.audio}
					duration={duration}
					setDuration={setDuration}
					setCurrentTime={setCurrentTime}
					isPlaying={isPlaying}
					setIsPlaying={setIsPlaying}
					rangeVolumeValue={rangeVolumeValue}
					isMuted={isMuted}
					goBackTenSeconds={goBackTenSeconds}
					setGoBackTenSeconds={setGoBackTenSeconds}
					advanceTenSeconds={advanceTenSeconds}
					setAdvanceTenSeconds={setAdvanceTenSeconds}
					stopRedirect={stopRedirect}
				/>

				<p>{formatTime(duration | 0)}</p>
				<div className="volume_control">
					<span ref={tooltip} className="range__volume-label">
						{toolTipVolume}
					</span>
					<div ref={divRangeAudioVolumeVolume} className="volume">
						<FontAwesomeIcon icon={iconVolume} onClick={() => handleMutedVol()} className="icon_volume" />
						<input
							id="range"
							type="range"
							ref={rangeAudioVolume}
							className="range__volume"
							min="0"
							max="10"
							step="1"
							disabled={rangeAudioVolumeDisabled}
							onInput={(e) => changeValueVolume(e)}
							style={{ background: rangeSoundBackgroundInput }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Player;
