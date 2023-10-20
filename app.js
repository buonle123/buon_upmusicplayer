const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'MISS_BABI'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdthumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isTimeUpdated: true,
    isRandom: false,
    isRepeat: false,
    songListed: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Thế hệ tan vỡ',
            singer: 'Kai Đinh',
            path: 'music/song1.mp3',
            image: 'img/img1.png'
        },
        {
            name: 'Giả vờ say',
            singer: 'Đông Nhi',
            path: 'music/song2.mp3',
            image: 'img/img2.png'
        },
        {
            name: 'Không mà em đây rồi',
            singer: 'Suni Hạ Linh',
            path: 'music/song3.mp3',
            image: 'img/img3.png'
        },
        {
            name: 'Thật ra em chẳng thương anh như vây đâu',
            singer: 'Nguyenn',
            path: 'music/song4.mp3',
            image: 'img/img4.png'
        },
        {
            name: 'Điều buồn nhất',
            singer: 'Kai Đinh',
            path: 'music/song5.mp3',
            image: 'img/img5.png'
        },
        {
            name: 'Sài gòn hôm nay mưa',
            singer: 'JSOL',
            path: 'music/song6.mp3',
            image: 'img/img6.png'
        }, {
            name: 'Anh luôn như vậy',
            singer: 'B Ray',
            path: 'music/song7.mp3',
            image: 'img/img7.png'
        }, {
            name: 'Con trai cưng',
            singer: 'B Ray',
            path: 'music/song8.mp3',
            image: 'img/img8.png'
        }, {
            name: 'Do you for love',
            singer: 'Amee',
            path: 'music/song9.mp3',
            image: 'img/img9.png'
        }, {
            name: 'Con gái rượu',
            singer: 'B Ray',
            path: 'music/song10.mp3',
            image: 'img/img10.png'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const _this = this;
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === _this.currentIndex ? 'active' : ''}" data-index="${index}">
                 <div class="thumb" 
                     style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handerEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // animation rotate cd
        const cdRotate = cdthumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdRotate.pause()
        // Phóng to thu nhỏ CD theo scroll
        document.onscroll = () => {
            const scrollTop = document.documentElement.scrollTop || window.scrollY

            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        // Play / Pause audio
        playBtn.onclick = () => {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        // Lắng nghe song đang play
        audio.onplay = () => {
            _this.isPlaying = true
            cdRotate.play()
            player.classList.add('playing')
        }
        // Lắng nghe song bị pause
        audio.onpause = () => {
            _this.isPlaying = false
            cdRotate.pause()
            player.classList.remove('playing')
        }

        // Xử lý thanh chạy theo thời gian chạy của bài hát
        audio.ontimeupdate = () => {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
            if (audio.duration && _this.isTimeUpdated) {
                progress.value = progressPercent
            }
        }
        progress.onchange = (e) => {
            const seekTime = (audio.duration * e.target.value) / 100
            audio.currentTime = seekTime
        }
        // fix lỗi seeked on progress
        progress.onmousedown = () => {
            _this.isTimeUpdated = false
        }
        progress.onmouseup = () => {
            _this.isTimeUpdated = true
        }
        // Xử lý button next audio
        nextBtn.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Xử lý button prev audio
        prevBtn.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Xử lý button random audio
        randomBtn.onclick = () => {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active')
        }

        repeatBtn.onclick = () => {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active')
        }

        // Xử lý khi audio chạy hết
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        playlist.onclick = (e) => {
            const songNode = e.target.closest('.song:not(.active')
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = songNode.dataset.index * 1
                    _this.loadcurrentSong()
                    _this.render()
                    audio.play()
                }
                if (e.target.closest('.option')) {
                    alert('mhuhuhu')
                }
            }
        }
    },
    loadcurrentSong: function () {
        console.log(this.currentSong);
        heading.textContent = this.currentSong.name
        cdthumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        this.setConfig('index', this.currentIndex)
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadcurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadcurrentSong()
    },
    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        for (let i of this.songListed) {
            if (i === newIndex) {
                console.log('before', newIndex);
                newIndex = Math.floor(Math.random() * this.songs.length);
                console.log('reload', newIndex);
            }
        }
        this.songListed.push(newIndex)

        if (this.songListed.length === this.songs.length) {
            this.songListed = []
        }
        this.currentIndex = newIndex

        console.log(this.songListed);
        console.log(this.currentIndex);
        this.loadcurrentSong()
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300);
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.currentIndex = this.config.index
        this.songListed.push(this.config.currentIndex)
        console.log(this.songListed);
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    },
    start: function () {
        // Gán cấu hình cài từ config vào app
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe / Xử lý các sự kiến (DOM events)
        this.handerEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadcurrentSong()

        // Render playlist
        this.render()
        // load button on config
        // randomBtn.classList.toggle('active')
        // repeatBtn.classList.toggle('active')

    }
}
app.start()
