/*
 Copyright 2022-2023 Jean-François Vaduret

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

function changeToMeters_One(element) {
    if (element.classList.contains("ddbc-combat-attack__range-value-long")) {
        element.textContent = "(" + (parseFloat(element.textContent.match(/\d+/)) * 30)/100 + ")";
    } else {
        element.textContent = (parseFloat(element.textContent) * 30)/100;
    }
}

function changeToMeters() {
    var distancesNumber, distancesUnit, numberOfDistances, newDistance;
    
    if (document.querySelector(".ddbc-distance-number")) {
        distancesNumber = document.querySelectorAll(".ddbc-distance-number__number");
        distancesUnit = document.querySelectorAll(".ddbc-distance-number__label");
        numberOfDistances = distancesNumber.length;
        
        for (var i = 0; i < numberOfDistances; i++){
            if (distancesUnit[i].textContent == 'ft.') {
                if (distancesNumber[i].textContent != "--") {
                    changeToMeters_One(distancesNumber[i]);
                }
                distancesUnit[i].textContent = 'm.';
            }
        }
    }
    if (document.querySelector(".ddbc-combat-attack__range-value-close")) {
        distancesNumber = document.querySelectorAll(".ddbc-combat-attack__range-value-close");
        distancesUnit = document.querySelectorAll(".ddbc-combat-attack__range-value-long");
        numberOfDistances = distancesNumber.length;
        
        for (var i = 0; i < numberOfDistances; i++){
            if (!distancesNumber[i].classList.contains("converted")) {
                changeToMeters_One(distancesNumber[i]);
                changeToMeters_One(distancesUnit[i]);
                distancesNumber[i].classList.add("converted");
            }
        }
    }
    changeItemRange();
}

function changeItemRange() {
    if (document.querySelector(".ddbc-note-components__component")){
        var regexItem = /\((\d+)\/(\d+)\)/g;
        var itemRange = document.querySelectorAll(".ddbc-note-components__component");
        var text, firstNumber, secondNumber;
        itemRange.forEach( (element) => {
            if(!element.classList.contains("converted")) {
                text = element.textContent;
                var matches = [...text.matchAll(regexItem)];
                if (matches.length != 0) {
                    matches.forEach( (match) => {
                        firstNumber = (parseFloat(match[1])*30)/100;
                        secondNumber = (parseFloat(match[2])*30)/100;
                        text = text.replace(regexItem, "(" + firstNumber + "/" + secondNumber + ")");
                    });
                    element.textContent = text;
                    element.classList.add("converted");
                }
            }
        });
    }
}

function changeToKilograms_One(elementNumber, elementUnit) {
    elementNumber.textContent = (parseFloat(elementNumber.textContent) *1000)/ 10000;
    elementUnit.textContent = "kg.";
}

function changeToKilograms() {
    
    if (document.querySelector(".ddbc-weight-number")) {
        var weightNumber = document.querySelectorAll(".ddbc-weight-number__number");
        var weightUnit = document.querySelectorAll(".ddbc-weight-number__label");
        weightNumber.forEach((element, index) => {
            if (weightUnit[index].textContent == 'lb.') {
                changeToKilograms_One(element, weightUnit[index]);
            }
        });
    }
    
    if (document.querySelector(".ct-equipment__container-weight-capacity")) {
        weightContainerCapacity = document.querySelectorAll(".ct-equipment__container-weight-capacity");
        var regexWeigthContainerCapacity = /\((\d+)\/(\d+) lb\)/g;
        var text, matches, firstNumber, secondNumber;
        weightContainerCapacity.forEach((element) => {
            text = element.textContent;
            matches = [...text.matchAll(regexWeigthContainerCapacity)];
            if (matches.length != 0) {
                matches.forEach((match) => {
                    firstNumber = (parseFloat(match[1]) *100)/ 1000;
                    secondNumber = (parseFloat(match[2]) *100)/ 1000;
                    text = text.replace(regexWeigthContainerCapacity, "(" + firstNumber  + "/" + secondNumber + " kg)");
                });
                element.textContent = text;
            }
            
        });
    }
}

function changeInText() {
    var divToSearch = [
        ".ct-senses__summary",
        ".jsx-parser",
        ".ddbc-html-content",
        ".ct-sidebar__pane",
        '.ct-sidebar__pane .ddbc-creature-block span[class$="-data"]',
        ".ddbc-item-name"
    ];
    var currDiv;
    divToSearch.forEach( (divClass) => {
        currDiv = document.querySelectorAll(divClass + " p");
        if (divClass == divToSearch[0] || divClass == divToSearch[4] || divClass == divToSearch[5]) {
            currDiv = document.querySelectorAll(divClass);
        }
        if ( currDiv ) {
            currDiv.forEach( (element) => {
                if (!element.classList.contains("checked")) {
                    changeZoneToMetersInText(element);
                    changeRangeToMetersInText(element);
                    changeCompositeToMetersInText(element);
                    changeWeightToKilogramsInText(element);
                    changeRangeToCentimetersInText(element);
                    element.classList.add("checked");
                }
            });
        }
    });
}

function changeZoneToMetersInText(element) {
    var regexZone = /(\d+) by (\d+) ft./g;
    var text = element.textContent;
    var matchesZone = [...text.matchAll(regexZone)];
    if (matchesZone != null && matchesZone.length != 0) {
        var firstNumber, secondNumber;
        matchesZone.forEach( (match) => {
            firstNumber = (parseFloat(match[1]) * 30)/100;
            secondNumber = (parseFloat(match[2]) * 30)/100;
            text = text.replace(regexZone, firstNumber + " by " + secondNumber + " m.");
        });
        element.textContent = text;
    }
}

function changeRangeToMetersInText(element) {
    var regexRange = [
        [/\d+ ft./g, /\d+ ft./, " m."],
        [/\d+ feet/g, /\d+ feet/, " meters"],
        [/\d+ foot/g, /\d+ foot/, " meters"],
        [/\d+-foot/g, /\d+-foot/, "-meters"]
    ];
    parseAndChangeText(element, regexRange, [30,100]);
}

function changeRangeToCentimetersInText(element) {
    var regexRangeCM = [
        [/\d+ in\./g, /\d+ in\./, " cm."],
        [/\d+ inches/g, /\d+ inches/, " centimeters"],
        [/\d+ inch/g, /\d+ inch/, " centimeters"],
        [/\d+-inch/g, /\d+-inch/, "-centimeters"]
    ];
    parseAndChangeText(element, regexRangeCM, [250,100]);
}

function changeCompositeToMetersInText(element) {
    var regexComposite = [
        [/\d+ cubic foot/g, /\d+ cubic foot/, " cubic meters"],
        [/\d+ cubic feet/g, /\d+ cubic feet/, " cubic meters"]
    ];
    parseAndChangeText(element, regexComposite, [30,1000]);
}

function changeWeightToKilogramsInText(element) {
    var regexWeight = [
        [/\d+ pounds/g, /\d+ pounds/, " kilograms"],
        [/\d+ pound/g, /\d+ pound/, " kilograms"],
        [/\d+-pounds/g, /\d+-pounds/, "-kilograms"]
    ];
    parseAndChangeText(element, regexWeight, [10,100]);
    
}

function parseAndChangeText(element, regex, rate) {
    var text = element.textContent;
    var matches;
    regex.forEach( (regexElement, index) => {
        matches = [...text.matchAll(regexElement[0])];
        if (matches.length != 0) {
            matches.forEach( (match) => {
                text = text.replace(regexElement[1], (parseFloat(match) * rate[0])/rate[1] + regexElement[2]);
            });
            element.textContent = text;
        }
    });
}

function changeInMonsterPage(){
    var divToSearch = [".mon-stat-block", ".mon-details__description-block", '.mon-stat-block span[class$="-data"]'];
    var currDiv;
    divToSearch.forEach( (divClass) => {
        currDiv = document.querySelectorAll(divClass + " p");
        if (divClass == divToSearch[2]) {
            currDiv = document.querySelectorAll(divClass);
        }
        if ( currDiv ) {
            currDiv.forEach( (element) => {
                if (!element.classList.contains("checked")) {
                    changeZoneToMetersInText(element);
                    changeRangeToMetersInText(element);
                    changeCompositeToMetersInText(element);
                    changeWeightToKilogramsInText(element);
                    changeRangeToCentimetersInText(element);
                    element.classList.add("checked");
                }
            });
        }
    });
}

function changeInCharacterPage() {
        changeToMeters();
        changeInText();
        changeToKilograms();
}

function observeWhenReady() {
    var observedNode = document.querySelector("body");
    if(!observedNode) {
        window.setTimeout(addObserverIfDesiredNodeAvailable,500);
        return;
    }
    var url = window.location.href;
    if (url.match(/characters/g)) {
        const observer = new MutationObserver( changeInCharacterPage );
        observer.observe(observedNode,{childList: true, subtree: true});
    } else {
        changeInMonsterPage();
    }
    
}

observeWhenReady();
