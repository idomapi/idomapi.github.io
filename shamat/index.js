const hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];
const date = '2025-08-06';
let currentHourIndex = 0;
let currentTime = hours[currentHourIndex];
let isPlaying = false;
let intervalId = null;
const layers = {
    tempature: '217158', // '216428'
    humidity: '217097',
    wind: '217098,217099'
};
let currentLayerName = layers.tempature;
const playSvg = '<svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_3406_1192)"><circle cx="16.5" cy="16.5" r="16" fill="#CFE3FF"></circle><path d="M25.0714 15.6752C25.7063 16.0418 25.7063 16.9582 25.0714 17.3248L12.9286 24.3355C12.2936 24.702 11.5 24.2438 11.5 23.5107L11.5 9.48932C11.5 8.75617 12.2937 8.29796 12.9286 8.66453L25.0714 15.6752Z" fill="#0062EF"></path></g><defs><clipPath id="clip0_3406_1192"><rect width="32" height="32" fill="white" transform="translate(0.5 0.5)"></rect></clipPath></defs></svg>';
const pauseSvg = '<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_3074_11085)"><circle cx="16.5" cy="16" r="16" fill="#CFE3FF"></circle><path d="M12 9L12 23" stroke="#0062EF" stroke-width="2" stroke-linecap="round"></path><path d="M20 9L20 23" stroke="#0062EF" stroke-width="2" stroke-linecap="round"></path></g><defs><clipPath id="clip0_3074_11085"><rect width="32" height="32" fill="white" transform="translate(0.5)"></rect></clipPath></defs></svg>';

function formatHebrewShort(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('he-IL', { month: 'short' }).format(date);
    return `${day} ${month}`;
}

function updateProgress() {
    const progress = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('currentTime');
    updateSteps();
    const steps = document.querySelectorAll('.step');
    const percentage = ((currentHourIndex + 1) / (hours.length)) * 100;
    progress.style.width = `${percentage - 0.5}%`;
    currentTimeDisplay.textContent = currentTime;
    // Align #currentTime exactly above the current step
    if (steps[currentHourIndex]) {
        const step = steps[currentHourIndex];
        const left = step.offsetLeft + step.offsetWidth / 2;
        currentTimeDisplay.style.left = `${left}px`;
        currentTimeDisplay.style.transform = 'translateX(-50%)';
    } else {
        currentTimeDisplay.style.left = `${percentage}%`;
        currentTimeDisplay.style.transform = 'translateX(-50%)';
    }
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
        playPauseButton.innerHTML = pauseSvg;
        intervalId = setInterval(() => {
            if (currentHourIndex < hours.length - 1) {
                currentHourIndex++;
            } else {
                currentHourIndex = 0;
            }

            currentTime = hours[currentHourIndex];
            adjustLayerFeatures();
            updateProgress();
        }, 1000);
    } else {
        isPlaying = false;
        playPauseButton.innerHTML = playSvg;
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
    document.getElementById('start-date').innerText = formatHebrewShort(date);
    document.getElementById('end-date').innerText = formatHebrewShort(date);
    document.getElementById('side-container').style.visibility = 'initial';
    addTimelineLisenter();
    updateProgress();
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
        layers: ['217097', '217098', '217099', '217158'],
        visibleLayers: [],
        showXY: true,
        identifyOnClick: true,
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
    const END_PADDING_PERCENT = 6;

    for (let i = 0; i < hours.length; i++) {
        const step = document.createElement('div');
        step.id = `step-${i}`;
        step.className = i === currentHourIndex || (i == 0 && currentHourIndex === 0) ? 'step current' : 'step';
        // For the last step, subtract END_PADDING_PERCENT from 100%
        let percentage;

        if (i === hours.length - 1) {
            percentage = 100 - END_PADDING_PERCENT;
        } else {
            percentage = (i / (hours.length - 1)) * (100 - END_PADDING_PERCENT);
        }

        step.style.left = `${percentage}%`;

        if (i < currentHourIndex) {
            step.style.backgroundColor = 'white';
            step.style.color = 'white';
        }

        timeline.appendChild(step);
    }
}

function changeLayer(layerName) {
    if (layers.hasOwnProperty(layerName)) {
        currentLayerName = layers[layerName];
    }
}

/**
 * Toggle visibility of map layers.
 * @param {string[]} layersOn - Array of layer IDs to turn on.
 * @param {string[]} layersOff - Array of layer IDs to turn off.
 */
function togglesetActiveLayers(layersOn, layersOff) {
    govmap.setVisibleLayers(layersOn, layersOff);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('playPause').innerHTML = playSvg;
    document.querySelectorAll('.card').forEach(card => {
        const cardData = card.querySelector('.card-data');
        if (cardData) {
            card.addEventListener('click', function () {
                if (cardData.classList.contains('close')) {
                    cardData.classList.remove('close');
                    card.classList.add('active');
                    document.querySelectorAll('.card').forEach(otherCard =>
                        otherCard.classList.toggle('active', otherCard === card)
                    );
                    document.querySelectorAll('.card-data').forEach(otherData =>
                        otherData.classList.toggle('close', otherData !== cardData)
                    );
                }

                if (card.id) {
                    changeLayer(card.id);
                    // Log the card id to the console
                    console.log('Card clicked:', card.id);
                    const layerNames = (toShow) => Object.keys(layers).filter(k => toShow ? k === card.id : k !== card.id)
                    const layersToHide = layerNames(false).map(l => layers[l].split(',')).flat();
                    const layersToShow = layerNames(true).map(l => layers[l].split(',')).flat();
                    togglesetActiveLayers(layersToShow, layersToHide);
                }
            });
        }
    });
});
