let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //showS all the songs in "Your Library"
    let songUL = document.querySelector(".songList").getElementsByTagName('ul')[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img src="music.svg" alt="">
                                               <div class="info">
                                                   <div>${song.replaceAll("%20", " ")}</div>
                                               </div>
                                               <div class="playnow">
                                                   <span>Play Now</span>
                                                   <img src="play.svg" width="30px" alt="">
                                               </div></li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    // document.querySelector(".songinfo").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            // get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60"
                    fill="none">
                    <circle cx="12" cy="12" r="10" fill="#1fdf64" />
                    <path
                        d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                        fill="black" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="" style="border-radius: 8px;">
            <h2 style="margin: 4px 0px;">${response.title}</h2>
            <p style="margin-top: 1px;">${response.description}</p>
        </div>`
        }
    }

    // load playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
}

async function main() {
    //get the lists of all songs
    await getSongs("songs/ncs");                     
    playMusic(songs[0], true);

    // display all the albums on the page
    displayAlbums();


    //Attach an event listener to the play, previous, next buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime1").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`
        document.querySelector(".songtime2").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //add an event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-125%";
    })

    //add an event listener to previous and next buttons
    previous.addEventListener("mousedown", event => {
        if (event.button === 0) {
            previous.src = "previousclicked.svg";
            previous.style.opacity = "0.9";
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if (currentSong.currentTime > 3) {
                currentSong.currentTime = 0;
            }
            else if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        }
    });

    previous.addEventListener("mouseup", event => {
        if (event.button === 0) {
            previous.src = "previous.svg";
            previous.style.opacity = "0.8";
        }
    });

    next.addEventListener("mousedown", event => {
        if (event.button === 0) {
            next.src = "nextclicked.svg";
            next.style.opacity = "1";
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        }
    });

    next.addEventListener("mouseup", event => {
        if (event.button === 0) {
            next.src = "next.svg";
            next.style.opacity = "0.8";
        }
    });

    // add an event to volumeBar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volumeBar>img").src = document.querySelector(".volumeBar>img").src.replace("mute.svg", "volume.svg");

        }
    })

    // add an event listener to mute the track
    document.querySelector(".volumeBar>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100
        }
    })



}

main(); 