const milestones = [
  {
    id: "start",
    text: "Start of game",
    excluded: true,
  },
  {
    id: "dragon",
    text: "Dragon",
  },
  {
    id: "fire",
    text: "Fire",
  },
  {
    id: "platinum",
    text: "Platinum",
  },
  {
    id: "magic",
    text: "Magic",
  },
  {
    id: "magicChallenges",
    text: "Magic challenges",
  },
  {
    id: "moreMagicUpgrades",
    text: "More magic upgrades",
    excluded: true,
  },
  {
    id: "uranium",
    text: "Uranium",
  },
  {
    id: "morePlatinumAndUranium",
    text: "More platinum and uranium",
    excluded: true,
  },
  {
    id: "darkMagicUpgrades",
    text: "Dark magic upgrades",
  },
  {
    id: "cyanSigils",
    text: "Cyan sigils",
  },
  {
    id: "blueSigils",
    text: "Blue sigils",
  },
  {
    id: "indigoSigils",
    text: "Indigo sigils",
  },
  {
    id: "violetSigils",
    text: "Violet sigils",
  },
  {
    id: "pinkSigils",
    text: "Pink sigils",
  },
  {
    id: "knowledge",
    text: "Knowledge",
  },
  {
    id: "tomes",
    text: "Tomes",
  },
  {
    id: "blueFire",
    text: "Blue fire"
  },
  {
    id: "blood",
    text: "Blood"
  },
  {
    id: "moreDarkMagicUpgrades",
    text: "More dark magic upgrades"
  },
  {
    id: "plutonium",
    text: "Plutonium"
  },
  {
    id: "redSigils",
    text: "Red sigils"
  },
  {
    id: "orangeSigils",
    text: "Orange sigils"
  },
  {
    id: "yellowSigils",
    text: "Yellow sigils"
  },
  {
    id: "holyTetrahedrons",
    text: "Holy tetrahedrons"
  },
  {
    id: "holyOctahedrons",
    text: "Holy octahedrons"
  },
  {
    id: "holyFire",
    text: "Holy fire"
  },
  {
    id: "voidMagicUpgrades",
    text: "Void magic upgrades"
  },
  {
    id: "holyDodecahedrons",
    text: "Holy dodecahedrons"
  },
  {
    id: "planets",
    text: "Planets"
  },
  {
    id: "omniversalHypergods",
    text: "Omniversal hypergods"
  },
  {
    id: "cosmicPlague",
    text: "Cosmic plague"
  },
  {
    id: "oganesson",
    text: "Oganesson"
  },
  {
    id: "lightAndDarkEssences",
    text: "Light and dark essences"
  },
  {
    id: "deathEssence",
    text: "Death essence"
  },
  {
    id: "nuclearPasta",
    text: "Nuclear pasta"
  },
  {
    id: "finalityEssence",
    text: "Finality essence"
  },
  {
    id: "finalityCubes",
    text: "Finality cubes"
  },
]

const milestonesBox = document.getElementById("milestones-box");
const milestonesBody = milestonesBox.querySelector("div.window-body");

function getElapsedTime(timeElapsed) {
  const elapsedTime = timeElapsed; // Convert milliseconds to seconds
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = Math.floor(elapsedTime % 60);

  return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

function updateMilestonesBox(milestones) {
  milestones = milestones || getMilestones();

  const currentMilestones = getCurrentMilestones(milestones);

  Object.entries(currentMilestones).forEach(([id, timings]) => {
    const paragraphElement = document.getElementById(`${id}Milestone`);

    if (paragraphElement) {
      paragraphElement.style.display = "block";
    }

    const textElement = document.getElementById(`${id}MilestoneText`);

    if (textElement) {
      textElement.innerText = getElapsedTime(timings.timeElapsed);
    }
  })
}

function getMilestones() {
  const allMilestonesString = localStorage.getItem("milestones") || '{}';

  return JSON.parse(allMilestonesString);
}

function getCurrentMilestones(milestones) {
  return (milestones || getMilestones())[game.gameId] || {};
}

function logMilestone(unlockCount) {
  const milestone = milestones[unlockCount];

  logMilestoneItem(milestone.id);
}

function logGameStart() {
  logMilestoneItem("gameStart");
}

function logGameEnd() {
  logMilestoneItem("gameEnd");
}

function logMilestoneItem(milestoneId) {
  const milestones = getMilestones();

  const currentMilestones = getCurrentMilestones(milestones);

  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format
  const currentTimeString = currentDate.toLocaleTimeString(); // Get the current time in HH:MM:SS format

  currentMilestones[milestoneId] = {
    dateTime: `${currentDateString} ${currentTimeString}`,
    timeElapsed: game.timePlayed
  }

  milestones[game.gameId] = currentMilestones;

  localStorage.setItem("milestones", JSON.stringify(milestones));

  updateMilestonesBox(milestones);
}
