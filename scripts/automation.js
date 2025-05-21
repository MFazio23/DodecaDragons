// Variable storage
const intervals = {};
const activeTasks = {};
const sigilCounts = {};
let automationTabButton = null;
let automationTabBody = null;
let lastSigilReset = 0;
let sigilCountDiv = null;
let lastPolyhedronResetCount = 0;
let lastPolyhedronReset = 0;
let challengeRunCount = 0;

// Constant/assigned elements
const automationTab = document.getElementById('automation-box') || document.getElementsByClassName("box")[15];
const knowledgeLevelInput = document.getElementById("knowledgeLevelInput");

// Colors
const inactiveButtonColor = "#008001";
const activeButtonColor = "#450189";
const activeButtonRGB = "rgb(69, 1, 137)";

const updateAutomationTab = () => {
  automationTab.querySelector(".title-bar-text").textContent = "Automation";
  automationTab.querySelector(".window-body").id = "automationTabBody";

  automationTabBody = document.getElementById("automationTabBody");

  automationTabBody.innerHTML = "";
  automationTabBody.style.padding = "0.5em";
};

const setUpAutomationButton = () => {
  automationTabButton = document.getElementById("automationTabButton");

  updateAutomationTab();
};

const setUpSigilAmounts = () => {
  const pStyle = "background-color: #444;margin: 4px;padding: 0.5em;";
  sigilCountDivContents = `
        <p id="red-sigil-counts" style="color: #d44;${pStyle}">Red/Red</p>
        <p id="orange-sigil-counts" style="color: #d84;${pStyle}">Orange/Orange</p>
        <p id="yellow-sigil-counts" style="color: #dd4;${pStyle}">Yellow/Yellow</p>`;

  sigilCountDiv = document.createElement("div");
  sigilCountDiv.id = "sigil-count";
  sigilCountDiv.style.marginBottom = "0.5em";
  sigilCountDiv.innerHTML = sigilCountDivContents;

  automationTabBody.appendChild(sigilCountDiv);

  sigilCounts.red = document.getElementById("red-sigil-counts");
  sigilCounts.orange = document.getElementById("orange-sigil-counts");
  sigilCounts.yellow = document.getElementById("yellow-sigil-counts");
};

const runWithPause = (action, pauseLength) =>
  new Promise((resolve) => {
    if (action) action();
    setTimeout(() => {
      resolve();
    }, pauseLength);
  });

const addButton = ({ buttonId, buttonText, action, parent }) => {
  parent = parent || automationTabBody;
  const button = document.createElement("button");
  button.id = buttonId;
  button.innerText = buttonText;
  button.style.minWidth = "45px";
  button.onclick = () => action();

  parent.appendChild(button);

  return button;
};

const addIntervalButton = ({intervalName, time, action, toggleOnAction, toggleOffAction, startEnabled, skipExtraText, parent}) => {
  const buttonId = `${intervalName.toLowerCase().replace(" ", "-")}`;

  const buttonAction = () => {
    if (!intervals[intervalName]) {
      toggleOnAction?.();
      action();
      intervals[intervalName] = setInterval(() => action(), time);
      button.innerText = skipExtraText ? intervalName : `Disable ${intervalName}`;
      button.style.backgroundColor = activeButtonColor;
      localStorage.setItem(buttonId, "true");
    } else {
      toggleOffAction?.();
      clearInterval(intervals[intervalName]);
      intervals[intervalName] = null;
      button.innerText = skipExtraText ? intervalName : `Enable ${intervalName}`;
      button.style.backgroundColor = inactiveButtonColor;
      localStorage.setItem(buttonId, "false");
    }
  };

  const button = addButton({
    buttonId: `toggle-${buttonId}`,
    buttonText: skipExtraText ? intervalName : `Enable ${intervalName}`,
    action: buttonAction,
    parent,
  });
  button.style.backgroundColor = inactiveButtonColor;
  button.style.color = "white";

  if (startEnabled || localStorage.getItem(buttonId) === "true") {
    button.click();
  }
};

const addIntervalRow = (rowId, buttonData) => {
  const div = document.createElement("div");
  div.id = rowId;
  div.style.display = "flex";
  div.style.flexDirection = "row";
  div.style.justifyContent = "space-between";
  div.style.marginRight = "4px";

  buttonData.forEach((data) => {
    addIntervalButton({
      intervalName: data.buttonText,
      time: data.time,
      action: data.action,
      startEnabled: data.startEnabled,
      skipExtraText: data.skipExtraText,
      parent: div,
    });
  });

  automationTabBody.appendChild(div);
};

const getKnowledgeTradeHigh = (ind) => new Decimal(1.5).pow(game.knowledgeTradeLevel.sub(1)).mul(knowledgeMultipliers[ind]).mul(11.25).floor().mul(100);

// Functional methods

const clearMagicChallenges = () => {
  game.selectedChallenges.forEach((isSelected, index) => {
    if (isSelected) {
      activateMagicChallenge(index + 1);
    }
  });
};

const handleAlchemyConvert = (upgradeButtonClass, toggleButtonId, convertFunction) => {
  const toggleButton = document.getElementById(toggleButtonId);
  const upgradeButtons = [...document.querySelectorAll(upgradeButtonClass)];
  const stopConverting = upgradeButtons.filter((b) => b.style.display !== "none" && b.disabled !== true).length === 0;

  if (stopConverting && toggleButton.style.backgroundColor === activeButtonRGB) {
    toggleButton.click();
  } else {
    convertFunction();
  }
};

const handlePlatinumConvert = () => {
  handleAlchemyConvert(".platinumUpgrade", "toggle-pt", platinumConvert);
};

const handleUraniumConvert = () => {
  handleAlchemyConvert(".uraniumUpgrade", "toggle-u", uraniumConvert);
};

const handlePlutoniumConvert = () => {
  handleAlchemyConvert(".plutoniumUpgrade", "toggle-pu", plutoniumConvert);
};

const handleAlchemyUpgrades = () => {
  if (!game.platinumUpgradesBought[4]) {
    if (game.platinum.mag >= 2000 || game.platinum.layer > 0) {
      buyPlatinumUpgrade(5);
    }
  } else {
    platinumMaxAll();
  }

  if (game.uraniumUpgradesBought[1] < 20 && game.uranium.layer === 0 && game.uranium.mag < 10000) {
    buyUraniumUpgrade(2);
  } else {
    uraniumMaxAll();
  }

  plutoniumMaxAll();

  if (game.oganesson.mag > 0) {
    for (let i = 7; i >= 1; i--) {
      buyOganessonUpgrade(i);
    }
  }
};

const handleAutoUpgradeDragon = () => {
  [...Array(10 - game.dragonStage).keys()].forEach((i) => {
    upgradeDragon(i + game.dragonStage);
  });
};

const handleUpgradeMagic = () => {
  magicUpgradeBuyMax();
  darkMagicUpgradeBuyMax();

  if (game.voidMagicUpgradesBought.some((u) => !u)) {
    for (let i = 1; i <= 17; i++) {
      buyVoidMagicUpgrade(i);
    }
  }
}

const getMagicScores = () => [game.magicScore1, game.magicScore2, game.magicScore3, game.magicScore4];

const shouldRerunMagicChallenge = (startingMagicScores) => {
  const magicScores = getMagicScores();

  const scoresNotInOrder = magicScores.some((score, index) => {
    return index > 0 && score.gte(magicScores[index - 1]);
  });

  const scoresWereHigher = magicScores.some((score, index) => {
    return score.lt(startingMagicScores[index]);
  });

  return scoresNotInOrder || scoresWereHigher;
};

const autoRunMagicChallenges = async () => {
  const challengeTime = 2000;
  const startingMagicScores = getMagicScores();

  const autoChallengeButton = document.getElementById("auto-challenge");
  autoChallengeButton.textContent = "Auto-challenge running";
  autoChallengeButton.style.backgroundColor = "#430087";
  autoChallengeButton.style.color = "white";

  clearMagicChallenges();
  console.log("Stating auto challenge");

  // If we have enough magic, change the order.
  const challengeOrder = game.magic.gte(8.5e15) ? [4, 3, 1, 2] : [1, 2, 4, 3];

  for (const challenge of challengeOrder) {
    activateMagicChallenge(challenge);
    await runWithPause(enterExitMagicChallenges, challengeTime);
    enterExitMagicChallenges();
  }

  dragonFeed();
  clearMagicChallenges();

  autoChallengeButton.style.backgroundColor = "";
  autoChallengeButton.style.color = "black";
  autoChallengeButton.textContent = "Start auto-challenge";

  if (challengeRunCount < 3 && shouldRerunMagicChallenge(startingMagicScores)) {
    console.log("Rerunning magic challenges", `Run count: ${challengeRunCount + 1}`);
    challengeRunCount++;
    autoRunMagicChallenges();
  } else {
    console.log("Magic challenges completed");
    challengeRunCount = 0;
  }
};

const autoResetSigils = (sigilType) => {
  const sigils = {
    cyan: {
      id: 1,
      toGet: game.cyanSigilsToGet,
    },
    blue: {
      id: 2,
      toGet: game.blueSigilsToGet,
    },
    indigo: {
      id: 3,
      toGet: game.indigoSigilsToGet,
    },
    violet: {
      id: 4,
      toGet: game.violetSigilsToGet,
    },
    pink: {
      id: 5,
      toGet: game.pinkSigilsToGet,
    },
  };

  if (Date.now() - lastSigilReset > 500) {
    const sigil = sigils[sigilType];

    if (sigil.toGet.sign > 0) {
      sigilCheck(sigil.id);
      lastSigilReset = Date.now();
      if (game.unlockedAchievements[7] < 2) {
        setTimeout(autoRunMagicChallenges, 500);
      }
    }
  }
};

const handleKnowledgeIncrease = () => {
  const totals = [game.cyanSigils, game.blueSigils, game.indigoSigils, game.violetSigils, game.pinkSigils].map((sigilCount, index) => {
    const tradeHigh = getKnowledgeTradeHigh(index);

    return {
      index,
      sigilCount,
      tradeHigh,
    };
  });

  const allHigher = totals.every(({ sigilCount, tradeHigh }) => sigilCount.gte(tradeHigh));

  if (allHigher) {
    knowledgeLevelInput.value = game.knowledgeTradeLevel.add(1);
    updateKnowledgeTradeLevel(2);
  }
};

const sigilResetterActiveCheckbox = document.getElementById("sigilResetterActive");

const sigilResetter = () => {
  const sigilResetToggleButton = document.getElementById("sigil-reset");
  sigilResetterActiveCheckbox.click();
  if (sigilResetterActiveCheckbox.checked) {
    sigilResetToggleButton.style.backgroundColor = "violet";
    sigilResetToggleButton.style.color = "white";
    sigilResetToggleButton.textContent = "Disable sigil reset";
  } else {
    sigilResetToggleButton.style.backgroundColor = "";
    sigilResetToggleButton.style.color = "black";
    sigilResetToggleButton.textContent = "Enable sigil reset";
  }
};

const sigilPlusHell = async () => {
  activeTasks["sigilPlusHell"] = true;
  const sigilPlusHellButton = document.getElementById("sigil-plus-hell");

  sigilPlusHellButton.textContent = "Running sigil reset + hell";
  sigilPlusHellButton.style.backgroundColor = "#d66";
  sigilPlusHellButton.style.color = "white";

  await runWithPause(() => sigilResetter(), 3_000);
  // Only enter hell if we have less than 7 void magic upgrades
  // The 7th upgrade automatically gets blood
  if (game.voidMagicUpgradesBought.length < 7) {
    await runWithPause(() => enterExitHell(), 2_000);
    await runWithPause(() => enterExitHell(), 3_000);
  }
  sigilResetter();

  sigilPlusHellButton.style.backgroundColor = "";
  sigilPlusHellButton.style.color = "black";
  sigilPlusHellButton.textContent = "Run sigil reset + hell";
  activeTasks["sigilPlusHell"] = false;
};

const setSigilCounts = () => {
  sigilCounts.red.textContent = `Red: ${format(game.redSigils, 0)} (${format(game.redSigilsToGet, 0)})`;
  sigilCounts.orange.textContent = `Orange: ${format(game.orangeSigils, 0)} (${format(game.orangeSigilsToGet, 0)})`;
  sigilCounts.yellow.textContent = `Yellow: ${format(game.yellowSigils, 0)} (${format(game.yellowSigilsToGet, 0)})`;
};

const missingSigilsAndAvailable = () => {
  const redSigilsAvailable = game.redSigils.sign === 0 && game.redSigilsToGet.sign > 0;
  const orangeSigilsAvailable = game.orangeSigils.sign === 0 && game.orangeSigilsToGet.sign > 0;
  const yellowSigilsAvailable = game.yellowSigils.sign === 0 && game.yellowSigilsToGet.sign > 0;

  return redSigilsAvailable || orangeSigilsAvailable || yellowSigilsAvailable;
};

const autoRerunBloodAndSigils = () => {
  if (missingSigilsAndAvailable() && !activeTasks.sigilPlusHell) {
    document.getElementById("sigil-plus-hell")?.click();
  }
};

const autoCollectHolyPolyhedrons = async () => {
  // Enough to buy a planet? Do it.
  const tetraPlanetReady = game.planetCosts[0].mag <= (game.holyTetrahedronsToGet.plus(game.holyTetrahedrons)).mag;
  const octaPlanetReady = game.planetCosts[1].mag < 500 && game.planetCosts[1].mag <= (game.holyOctahedronsToGet.plus(game.holyOctahedrons)).mag;
  const dodecaPlanetReady = game.planetCosts[2].mag < 200 && game.planetCosts[2].mag <= (game.holyDodecahedronsToGet.plus(game.holyDodecahedrons)).mag;

  // Magnitude is 10% higher? Do it.
  const tetraUpgradeReady = game.holyTetrahedronsToGet.mag * game.holyTetrahedronsToGet.layer > game.holyTetrahedrons.mag * 1.1;
  const octaUpgradeReady = game.holyOctahedronsToGet.mag * game.holyOctahedronsToGet.layer > game.holyOctahedrons.mag * 1.1;
  const dodecaUpgradeReady = game.holyDodecahedronsToGet.mag * game.holyDodecahedronsToGet.layer > game.holyDodecahedrons.mag * 1.1;

  if (tetraPlanetReady || tetraUpgradeReady) holyPolyhedronCheck(1);
  else if (octaPlanetReady || octaUpgradeReady) holyPolyhedronCheck(2);
  else if (dodecaPlanetReady || dodecaUpgradeReady) holyPolyhedronCheck(3);

  // Reset the timer if we have a planet or upgrade ready
  if (tetraPlanetReady || octaPlanetReady || dodecaPlanetReady || tetraUpgradeReady || octaUpgradeReady || dodecaUpgradeReady) {
    console.log("Upgrade or planet ready");
    console.log("Planets", `Tetra: ${tetraPlanetReady}, Octa: ${octaPlanetReady}, Dodeca: ${dodecaPlanetReady}`);
    console.log("Upgrades", `Tetra: ${tetraUpgradeReady}, Octa: ${octaUpgradeReady}, Dodeca: ${dodecaUpgradeReady}`);
    lastPolyhedronReset = new Date().getTime();
    lastPolyhedronResetCount = 0;
    // If we haven't reset in 10 seconds, collect the polyhedrons
  } else if (lastPolyhedronReset + 10_000 < new Date().getTime()) {
    const tetraDiff = (game.holyTetrahedronsToGet.mag * game.holyTetrahedronsToGet.layer) / game.holyTetrahedrons.mag;
    const octaDiff = (game.holyOctahedronsToGet.mag * game.holyOctahedronsToGet.layer) / game.holyOctahedrons.mag;
    const dodecaDiff = (game.holyDodecahedronsToGet.mag * game.holyDodecahedronsToGet.layer) / game.holyDodecahedrons.mag;

    console.log("Timeout complete, attempting to reset polyhedrons", tetraDiff, octaDiff, dodecaDiff);

    if (tetraDiff < 1.1 && octaDiff < 1.1 && dodecaDiff < 1.1) {
      lastPolyhedronResetCount++;
      if (lastPolyhedronResetCount >= 10) {
        console.log("It's been long enough, we're resetting the best one.");
        //Reset the largest gain
        if (tetraDiff > octaDiff && tetraDiff > dodecaDiff) {
          console.log("Resetting tetrahedrons");
          holyPolyhedronCheck(1);
        } else if (octaDiff > tetraDiff && octaDiff > dodecaDiff) {
          console.log("Resetting octahedrons");
          holyPolyhedronCheck(2);
        } else if (dodecaDiff > tetraDiff && dodecaDiff > octaDiff) {
          console.log("Resetting dodecahedrons");
          holyPolyhedronCheck(3);
        }
        lastPolyhedronResetCount = 0;
      } else {
        console.log(`Attempt #${lastPolyhedronResetCount} - No holy polyhedrons are ready, waiting another 10 seconds.`);
      }
    } else if (tetraDiff > octaDiff && tetraDiff > dodecaDiff) holyPolyhedronCheck(1);
    else if (octaDiff > tetraDiff && octaDiff > dodecaDiff) holyPolyhedronCheck(2);
    else if (dodecaDiff > tetraDiff && dodecaDiff > octaDiff) holyPolyhedronCheck(3);

    // Reset the timer
    lastPolyhedronReset = new Date().getTime();
  }
};

const getPlanetUpgradeCostText = () => {
  const costsText = game.planetCosts.map((cost) => Math.round(cost.mag)).join(", ");

  return ` (${costsText})`;
};

// Set up the automation tab first
setUpAutomationButton();

// Button setup
addIntervalButton({
  intervalName: "auto-mine",
  time: 10,
  action: () => produceGold(),
  startEnabled: true,
})
addIntervalButton({
  intervalName: "auto-max miners",
  time: 100,
  action: () => buyMaxMiners(),
  startEnabled: false,
})
addIntervalButton({
  intervalName: "auto fire",
  time: 100,
  action: () => fireMaxAll(),
  startEnabled: false,
})
addIntervalButton({
  intervalName: "max alchemy",
  time: 1000,
  action: () => handleAlchemyUpgrades(),
  startEnabled: true,
});

addIntervalRow("alchemy-row", [
  {
    intervalName: "auto-convert-platinum",
    buttonText: "Pt",
    time: 1000,
    skipExtraText: true,
    action: () => handlePlatinumConvert(),
  },
  {
    intervalName: "auto-convert-uranium",
    buttonText: "U",
    time: 1000,
    skipExtraText: true,
    action: () => handleUraniumConvert(),
  },
  {
    intervalName: "auto-convert-plutonium",
    buttonText: "Pu",
    time: 1000,
    skipExtraText: true,
    action: () => handlePlutoniumConvert(),
  },
]);

addIntervalButton({
  intervalName: "auto-upgrade dragon",
  time: 100,
  action: () => handleAutoUpgradeDragon(),
  startEnabled: true,
});
addIntervalButton({
  intervalName: "auto-feed",
  time: 100,
  action: () => dragonFeed(),
  startEnabled: true,
});
addIntervalButton({
  intervalName: "auto-upgrade magic",
  time: 100,
  action: () => handleUpgradeMagic(),
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto-spend time",
  time: 100,
  action: () => dragonSpendTime(),
  startEnabled: false,
});

addIntervalRow("sigils-top-row", [
  {
    intervalName: "auto-reset-cyan-sigils",
    buttonText: "Cyan",
    time: 100,
    skipExtraText: true,
    action: () => autoResetSigils("cyan"),
  },
  {
    intervalName: "auto-reset-blue-sigils",
    buttonText: "Blue",
    time: 100,
    skipExtraText: true,
    action: () => autoResetSigils("blue"),
  },
  {
    intervalName: "auto-reset-indigo-sigils",
    buttonText: "Indigo",
    time: 100,
    skipExtraText: true,
    action: () => autoResetSigils("indigo"),
  },
]);

addIntervalRow("sigils-bottom-row", [
  {
    intervalName: "auto-reset-violet-sigils",
    buttonText: "Violet",
    time: 100,
    skipExtraText: true,
    action: () => autoResetSigils("violet"),
  },
  {
    intervalName: "auto-reset-pink-sigils",
    buttonText: "Pink",
    time: 100,
    skipExtraText: true,
    action: () => autoResetSigils("pink"),
  },
]);/*
addIntervalButton(
    "auto-upgrade sigils",
    100,
    () => {
        maxAllSigilUpgrades();
        maxRedSigilUpgrades();
        maxOrangeSigilUpgrades();
        maxYellowSigilUpgrades();
    },
    false
);
addIntervalButton(
    "auto-trade knowledge",
    10,
    () => {
        purchaseKnowledgeTrade(3);
        buyKnowledgeUpgrade(1);
        buyKnowledgeUpgrade(2);
        handleKnowledgeIncrease();
    },
    false
);
addIntervalButton(
    "max tomes",
    1000,
    () => {
        buyMaxTomes();
        tomeUpgradeBuyMax();
    },
    false
);
addIntervalButton(
    "auto-buy tome upgrades",
    1000,
    () => {
        for (let i = 1; i <= 11; i++) {
            buyTomeUpgrade(i);
        }
    },
    false
); */
addIntervalButton({
  intervalName: "auto-upgrade sigils",
  time: 100,
  action: () => {
    maxAllSigilUpgrades();
    maxRedSigilUpgrades();
    maxOrangeSigilUpgrades();
    maxYellowSigilUpgrades();
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto-trade knowledge",
  time: 10,
  action: () => {
    purchaseKnowledgeTrade(3);
    buyKnowledgeUpgrade(1);
    buyKnowledgeUpgrade(2);
    handleKnowledgeIncrease();
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "max tomes",
  time: 1000,
  action: () => {
    buyMaxTomes();
    tomeUpgradeBuyMax();
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto-buy tome upgrades",
  time: 1000,
  action: () => {
    for (let i = 1; i <= 11; i++) {
      buyTomeUpgrade(i);
    }
  },
  startEnabled: false,
});

addIntervalButton({
  intervalName: "auto-run blood + sigils",
  time: 100,
  action: () => autoRerunBloodAndSigils(),
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto blue fire",
  time: 100,
  action: () => blueFireMaxAll(),
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto holy fire",
  time: 100,
  action: () => holyFireMaxAll(),
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto-buy void magic",
  time: 1000,
  action: () => {
    for (let i = 1; i <= 17; i++) buyVoidMagicUpgrade(i);
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto-collect polyhedrons",
  time: 1000,
  action: async () => autoCollectHolyPolyhedrons(),
  toggleOnAction: () => {
    lastPolyhedronReset = new Date().getTime();
    lastPolyhedronResetCount = 0;
  },
  startEnabled: false,
});

addIntervalButton({
  intervalName: "auto-planets",
  time: 1000,
  action: () => {
    formPlanet(1);
    formPlanet(2);
    formPlanet(3);
    planetBuyMax();
    gainSupercluster();
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto-defeat Hypergod",
  time: 30_000,
  action: () => {
    defeatHypergod();
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto Cosmic Plague",
  time: 100,
  action: () => {
    plagueMaxAll();
    gainSpore();
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto max essence",
  time: 100,
  action: () => {
    lightEssenceMaxAll();
    darkEssenceMaxAll();
    deathEssenceMaxAll();
    finalityEssenceMaxAll();
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto pasta",
  time: 1000,
  action: () => {
    gainMaxPasta();
    buyNuclearPastaUpgrade(1);
    buyNuclearPastaUpgrade(2);
    buyNuclearPastaUpgrade(3);
    buyNuclearPastaUpgrade(4);
  },
  startEnabled: false,
});
addIntervalButton({
  intervalName: "auto finality cubes",
  time: 1000,
  action: () => {
    gainMaxFinalityCubes();
    boostFinalityCubes();
    boostFinalityBoosts();
  },
  startEnabled: false,
});

addButton({
  buttonId: "auto-challenge",
  buttonText: "Start auto-challenge",
  action: () => autoRunMagicChallenges(),
})

addButton({
  buttonId: "sigil-reset",
  buttonText: "Toggle sigil reset",
  action: () => sigilResetter(),
});

addButton({
  buttonId: "sigil-plus-hell",
  buttonText: "Run sigil reset + hell",
  action: async () => sigilPlusHell(),
});

setUpSigilAmounts();

setInterval(() => setSigilCounts(), 1000);

/*
TODO:
- The order of challenges should change based on how much magic you have.
    - What's the right order?
    - When does this flip?
- Magic challenges should only be re-run a certain number of times
    - If it's a lower number, it gets stuck re-running continually.
- Add timing landmarks for different events:
    - Sigils
    - ???
- Add automation for sigils before it's available in-game
- Automation for auto-collecting holy polyhedrons doesn't work for low amounts
    - The layer check isn't quite right, need to adjust.
- Add a way to automatically take actions after buying a particular upgrade.
    - i.e. once you buy something that boosts challenge score gain, run another auto-challenge.
- Auto-buy next level of sigils
*/
