const hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'];
const date = '2025-08-06';
let currentHourIndex = 0;
let currentTime = hours[currentHourIndex];
let isPlaying = false;
let intervalId = null;
const layers = {
    tempature: '216428',
    humidity: 'TBD',
    wind: 'TBD'
}
let currentLayerName = layers.tempature;

function updateProgress() {
    const progress = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('currentTime');
    const percentage = (currentHourIndex / (hours.length - 1)) * 100;
    progress.style.width = `${percentage}%`;
    currentTimeDisplay.textContent = currentTime;
    currentTimeDisplay.style.left = `${percentage}%`;
    updateSteps();
}

function prevHour() {
    if (currentHourIndex > 0) {
        currentHourIndex--;
        currentTime = hours[currentHourIndex];
        adjustLayerFeatures();
        updateProgress();
    }
}

function nextHour() {
    if (currentHourIndex < hours.length - 1) {
        currentHourIndex++;
        currentTime = hours[currentHourIndex];
        adjustLayerFeatures();
        updateProgress();
    }
}

function playPause() {
    const playPauseButton = document.getElementById('playPause');
    if (!isPlaying) {
        isPlaying = true;
        playPauseButton.textContent = '⏸';
        intervalId = setInterval(() => {
            if (currentHourIndex < hours.length - 1) {
                currentHourIndex++;
                currentTime = hours[currentHourIndex];
                adjustLayerFeatures();
                updateProgress();
            } else {
                clearInterval(intervalId);
                isPlaying = false;
                playPauseButton.textContent = '▶';
            }
        }, 1000);
    } else {
        isPlaying = false;
        playPauseButton.textContent = '▶';
        clearInterval(intervalId);
    }
}

function setHour(event) {
    const timeline = event.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    currentHourIndex = Math.min(Math.max(Math.round(percentage * (hours.length - 1)), 0), hours.length - 1);
    currentTime = hours[currentHourIndex];
    adjustLayerFeatures();
    updateProgress();
}

function adjustLayerFeatures() {
    var params = {
        layerName: currentLayerName,
        whereClause: `(date='2025-08-06') AND (time='${currentTime}')`,
    };
    govmap.filterLayers(params);
}

function addTimelineLisenter() {
    document.querySelector('.timeline').addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY < 0 && currentHourIndex > 0) {
            prevHour();
        } else if (event.deltaY > 0 && currentHourIndex < hours.length - 1) {
            nextHour();
        }
    });
}

function handleOnLoad() {
    document.getElementById('currentTime').innerText = currentTime;
    document.getElementById('start-time').innerText = hours[0];
    document.getElementById('end-time').innerText = hours[hours.length - 1];
    document.getElementById('side-container').style.visibility = 'initial';
    addTimelineLisenter();
    updateSteps();
}

function getOtherLayers() {
    return Object.keys(layers).filter(key => layers[key] !== currentLayerName);
}

function turnOnTempatureApp() {
    const layersToHide = getOtherLayers();
    govmap.setVisibleLayers([currentLayerName], layersToHide);
    adjustLayerFeatures();
}

function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ['216428'],
        visibleLayers: [],
        showXY: true,
        identifyOnClick: false,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 4,
        center: { x: 179487, y: 663941 },
        level: 2,
        onLoad: function () {
            handleOnLoad();
            turnOnTempatureApp();
        },
    });
}

function updateSteps() {
    const timeline = document.querySelector('.timeline');
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.remove());
    for (let i = 0; i < hours.length; i++) {
        const step = document.createElement('div');
        step.className = 'step';
        const percentage = (i / (hours.length - 1)) * 100;
        step.style.left = `${percentage}%`;
        if (i < currentHourIndex) {
            step.style.backgroundColor = 'white';
        }
        timeline.appendChild(step);
    }
}

function changeLayer(layerName) {
    if (layerType !== 'tempature') return;

    currentLayerName = layers[layerName];
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.card').forEach(card => {
        const cardData = card.querySelector('.card-data');
        if (cardData) {
            card.addEventListener('click', function() {
                if (cardData.classList.contains('close')) {
                    cardData.classList.remove('close');
                    document.querySelectorAll('.card-data').forEach(otherData => {
                        if (otherData !== cardData) {
                            otherData.classList.add('close');
                        }
                    });
                }

                if (card.id) {
                    changeLayer(card.id);
                }
            });
        }
    });
});

