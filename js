let stateTabFast = false;
document.addEventListener("DOMContentLoaded", ()=> {



        //event press
        dispatchTabEvent();

});

/**
 * check si la est arreté
 * @returns <boolean>
 */
function isSumulationTabStop() {
    return _simulationTabStop;
}

/**
 * 
 * @param {boobean} stop 
 */
function setSumulationTabStop(stop) {
    console.log('===> setSimulationTabStop :', stop);
    _simulationTabStop = stop;
}

function dispatchTabEvent() {
    let tabulationEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        while: 9,
        bubbles: true,
        cancelable: true
    });

    document.dispatchEvent(tabulationEvent);
}

/**
 * check si l' element est visible
 * */
function isElementVisible(elem) {
    const style = getComputedStyle(elem);


    return !$(elem).hasClass('test-simulation-tab-btn') &&
        $(elem).is(':visible') &&
        $(elem).css('visibility') !== 'hidden' &&
        $(elem).css('opacity') !== '0' &&
        $(elem).width() > 0 &&
        $(elem).height() > 0;
}


/**
 * get tous les éléménts qu on peux manipuler avec la tabulation du clavier
 * @returns [dom]
 */
function getAllTabbableElemenets() {
    const elements = Array.from(
        document.querySelectorAll('a, button, input, [tabindex], select')
      ).filter(element => !element.closest('#ergoqual'));
      

    return elements
        .filter(el=> {
            const tabindex = parseInt(el.getAttribute('tabindex'), 10);
            return (isNaN(tabindex) || tabindex >= 0) && isElementVisible(el);
        })
        .sort((elemA, elemB) => {
            const tabindexA = parseInt(elemA.getAttribute('tabindex'), 10 ) || 0;
            const tabindexB = parseInt(elemB.getAttribute('tabindex'), 10 ) || 0;
            return tabindexA - tabindexB;
        });
}

function diaplayNoFocusableLink() {
    let tabs = getNoFocusableLink();

    tabs.forEach(el => {
        el.classList.add("test-sumulation-no-focus");
    })
}

/**
 * get display link with index < 0
 * @returns
 */
function getNoFocusableLink() {
    const elements = Array.from(document.querySelectorAll('a, button, input, [tabindex]'));

    return elements
        .filter(el => {
            const tabindex = parseInt(el.getAttribute('tabindex'), 10);
            return !(isNaN(tabindex) || tabindex >= 0) && isElementVisible(el);
        })
        .sort((elemA, elemB) => {
            const tabindexA = parseInt(elemA.getAttribute('tabindex'), 10) || 0;
            const tabindexB = parseInt(elemB.getAttribute('tabindex'), 10) || 0;
            return tabindexA - tabindexB;
        });
}


/**
 * récupère toutes les tabbables elements puis fait le parcours
 * @param {boolean} isAscendant
 */
function simulateNavigationTab(isAscendant = false) {
console.log("start simulation tab !");
    //liste des éléments tabbables
    let tabs = getAllTabbableElemenets();
    console.log(tabs);

    if (isAscendant) {
        tabs = tabs.reverse();
    }
    
    //defaultIndex
    let indexElement = 0;

    //create svg container
    createSvgContainer();

    function nextElement() {
        
        if (indexElement >= tabs.length || isSumulationTabStop()) {
            setSumulationTabStop(true);
            return;
        }   

        let timing = isSimulationWithAnnimation() ? 0 : 400;

        const currentElement = tabs[indexElement];

        if(indexElement == 0) {
            _currentFocusLink = getElementOffset(currentElement);
        }

        //draw svg arrow
        if (indexElement > 0) {

            _lastFocusLink = _currentFocusLink;
            _currentFocusLink = getElementOffset(currentElement);
            console.log('draw ', indexElement + 1);
            drawSvgArrowElement(_lastFocusLink, _currentFocusLink, (indexElement));
        }

        //focus
        currentElement.focus();

        //dispatch mouse hover
        currentElement.dispatchEvent(new MouseEvent('mouseover', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        }));

        //todo, to delete
        console.log((indexElement + 1) + " / " + currentElement.textContent);
        //currentElement.textContent = (indexElement + 1 ) + " / " + currentElement.textContent;

        let numberSpan = document.createElement('span');
        numberSpan.classList.add('test-tab-simulation-indexlink-number');
        numberSpan.style.left = currentElement.getBoundingClientRect().left + window.screenX + ' !important';
        numberSpan.style.top = currentElement.getBoundingClientRect().top + window.screenY + ' !important';
        
        currentElement.appendChild(numberSpan)
        
        //ajout de class
        currentElement.classList.add('test-tab-simulated-selected-dom');
        currentElement.classList.add('test-tab-simulation-selected-dom');

        let spanNb = document.createElement('span');
        spanNb.classList.add('test-tab-simulated-selected-dom-nb');
        currentElement.append(spanNb);


        //creation diagram
        if(indexElement > 0) {
            let indexLink = document.createElement('div');
            indexLink.setAttribute('id', 'tab_simulation_indexlink_' + indexElement);
            indexLink.classList.add('test-tab-simulation-indexlink');
            indexLink.style.height  = '5px !important';
        }

        setTimeout(() => {
            indexElement ++;
            currentElement.classList.remove('test-tab-simulation-selected-dom');
            nextElement();
        }, timing)
    }

    // simulate tabbable next element
    setSumulationTabStop(false);
    nextElement();
} 

function onStartSimulationTabKey (e) {
    startSimulationAction();
}

function onStartSimulationFromLastTabKey() {
    startSimulationAction(true);
}

function onStartSimulationTabFastKey (tabFastValue) {
    stateTabFast = tabFastValue;
}

/**
 * 
 * @param {*} isDescendant 
 * @returns 
 */
function startSimulationAction(isDescendant) {
    if (isSimulationLanched()) {
        if (confirm("Une simulation est déjà lancée sur cette page. Veillez actualiser pour pouvoir le lancer de nouveau")) {
            //location.reload();
        }
        return;
    }
    simulateNavigationTab(isDescendant);
    diaplayNoFocusableLink();
}

/**
 * 
 * @returns boolean
 */
function isSimulationWithAnnimation() {
    return stateTabFast;
}

function isSimulationLanched() {
   return !!document.getElementById('simulation_tab_container');
}

/**
 * get la position d'un element du dom
 * @param {*} elem 
 * @returns {left, top, width, height}
 */
function getElementOffset(elem) {
    const position = elem.getBoundingClientRect();

    return {
        left: position.left + window.scrollX,
        top: position.top + window.scrollY,
        width: position.width,
        height: position.height
    }
}

/**
 * creation d un svg container pour contenir toute les graphes (arrow)
 */
function createSvgContainer() {
    
    //create svg
    if (document.getElementById('simulation_tab_container')) {
        document.removeChild(document.getElementById('simulation_tab_container'));
    }

    let svgDraw = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDraw.setAttribute('width', window.innerWidth);
    svgDraw.setAttribute('height', window.innerHeight);
    svgDraw.setAttribute('id', 'simulation_tab_container');

    document.querySelector('body').appendChild(svgDraw);
}

/**
 * creation de l'image (arrow svg)flèche
 * @param {*} elem1 
 * @param {*} elem2 
 * @param {*} textArrowValue 
 */
function drawSvgArrowElement(elem1, elem2, textArrowValue = '') {
            
    labelText = textArrowValue;

    const fromOffset = elem1;
    const toOffset = elem2;

    // Points de départ et d'arrivée de la flèche
    const startX = fromOffset.left + fromOffset.width / 2;
    const startY = fromOffset.top + fromOffset.height / 2;
    const endX = toOffset.left + toOffset.width / 2;
    const endY = toOffset.top + toOffset.height / 2;

    console.log("startX : " + startX + " startY : " + startY + " endX: " + endX + " endY: " + endY);

    // svg
    const svg = document.getElementById('simulation_tab_container');
    svg.setAttribute('width', window.screen.availWidth);
    svg.setAttribute('height', getscreenHeight());
    svg.style.zIndex = 9999;

    // flèche
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrow.setAttribute('x1', startX);
    arrow.setAttribute('y1', startY);
    arrow.setAttribute('x2', endX);
    arrow.setAttribute('y2', endY);
    arrow.setAttribute('class', 'animated-arrow');
    arrow.setAttribute('marker-end', 'url(#arrowhead)');

    
    // poligon
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowhead.setAttribute('points', '0 0, 10 3.5, 0 7');
    arrowhead.setAttribute('fill', '#b85e05');
    marker.appendChild(arrowhead);

    // append svg
    svg.appendChild(marker);
    svg.appendChild(arrow);

    // fleche
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (startX + endX) / 2);
    text.setAttribute('y', (startY + endY) / 2 - 10); // Positionner légèrement au-dessus de la flèche
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'black');
    text.setAttribute('class', 'animated-arrow-text');
    text.textContent = labelText;
    svg.appendChild(text);

}

/**
 * get screen height with scroll height
 * @returns <number>
 */
function getscreenHeight() {
    var d= document.documentElement;
    var b= document.body;
    var who= d.offsetHeight? d: b ;
    return Math.max(who.scrollHeight,who.offsetHeight);
}
