import { stats } from '../data/stats.js'

function BonusDmg (className , count) {
    if(count <= 1) return 0
    const find = stats.find(data => data.className === className)
    return Math.floor((find.skill * 100) / 500)
}

function PaperClassDmg (classNameATK , classNameDEF) { 
    const atk = stats.find(data => data.className === classNameATK)
    const def = stats.find(data => data.className === classNameDEF)

    const atkDraw = atk.classId === def.classId

    if(atkDraw) return 0
    const atkWin = atk.win.some(win => win === def.className)

    if(atkWin) return 15
    const atkLose =  atk.lose.some(win => win === def.className)

    if(atkLose) return -15
}

function calculateDmg (dmg , perpents) {
    let total = dmg
    perpents.forEach(perpent => {
        if(perpent) {
            total = Math.floor(total * ((100 + +perpent || 0) / 100))
        }
    })
    
    return total
}

function ResultDmg (array ,classNameDEF) {

    let perCard = []
    const total = array.reduce((total , card ) => {
        const bonus = BonusDmg(card.className , array.length)
        const paper = PaperClassDmg(card.className, classNameDEF)
        let percents = []
            card.atkup.forEach(atk => percents = [...percents,+atk])
            percents = [...percents,paper,bonus,card.bonus]
           
        const calcu = calculateDmg(card.dmg ,percents)

        perCard = [...perCard , calcu]
        return Math.floor(total + calcu)
    },0)

    // const diff = array.length * 0.33
    // return Math.round(total + diff)

    return [perCard , total]
}

function InSameClass (array,classNameATK) {
    let newData = []
    for(const data of array){
        if(data.className === classNameATK) {
            newData = [...newData , {...data , bonus : 10} 
            ]
            continue
        }
        newData = [...newData , {...data , bonus : 0} ]
    }
    
    return newData
}

function Required (data) {
    return data === '' || data == null
}

function onError(elem) {
    elem.classList.add('is-invalid')
}

function onSuccess(elem) {
    elem.classList.remove('is-invalid')
}

function onSubmit (event) {
    event.preventDefault()

    const axieElem = document.querySelector('#axie') 
    const targetElem = document.querySelector('#target') 
    const classElem = document.querySelector('#class') 
    const dmgElem = document.querySelector('#dmg') 

    const validateElems = [axieElem , targetElem , classElem,dmgElem]
    let error = []
    for(const elem of validateElems) {

        if(Required(elem.value)) {
            onError(elem)
            error = [...error,true]
        }else {
            onSuccess(elem)
        }

    }

    if(error.length) return false

    const inputs = event.target.getElementsByTagName("input");
    const selects = event.target.getElementsByTagName("select");

    let data = {}
    for(let i = 0 ;i < inputs.length;i++) {
        if(inputs[i].id !== 'dmg') {
            data = {
                ...data, ...{
                    [inputs[i].id] : inputs[i].value
                }
            }
        }
    }

    for(let i = 0 ;i < selects.length;i++) {
        if(selects[i].id !== 'class') {
            data = {
                ...data, ...{
                    [selects[i].id] : selects[i].value
                }
            }
        }
    }
    const dmgs = document.getElementsByName("dmgCard");
    const atkups = document.getElementsByName("atkupCard");
    const classNames = document.getElementsByName("classCard")
    let cards = []
   
    for(let i = 0 ;i < dmgs.length;i++) {
        const dmg = +dmgs[i].value || 0
        const atkup =  atkups[i].value.split(',') || []
        const className = classNames[i].value
        if(dmg && className) {
            cards = [...cards, {
                    dmg,
                    atkup,
                    className
                }
            ]
        }
    }
    const newCards  = InSameClass(cards , data.axie)

    const [perCard , totalDmg] = ResultDmg(newCards , data.target)

    let { hp , armor } = data

    hp = hp || 0
    armor = armor || 0
   
    const result = +hp + +armor - totalDmg 
    const color = +result <= 0 ? 'color:red' : 'color:green'

    const resultElem = document.querySelector('#result')
    resultElem.classList.add('visible')
    resultElem.innerHTML = `
        <h4> 
            <b style="color:red"> Total dmg : ${totalDmg} </b> <br>
            <b style="${color}">  Life hp : ${ result } </b> 
        </h4>
        dmg /card : <b style="color:red"> ${perCard.join('/')} </b>
    `
}

function EndTurn () {
   
    const round = document.querySelector('#round')
    const energy = document.querySelector('#energy')
    const card = document.querySelector('#card')
    const reset = document.querySelector('#resetTurn')
    const end = document.querySelector('#endTurn')
    end.addEventListener('click',() => {
        round.innerHTML = +round.innerHTML +1
        energy.value =  +energy.value + 2
        if(+energy.value > 10) energy.value = 10
        card.value = +card.value + 3

        if(+card.value > 18) card.value = 18

        AxieEnergy()
        AxieCard()
    })

    reset.addEventListener('click',() => {
        round.innerHTML = 1
        energy.value = 3
        card.value = 6

        AxieEnergy()
        AxieCard()
    })

}

function CountAnythings () {
    const energy = document.querySelector('#energy')
    const plus = document.querySelector('#plus');

    plus?.addEventListener('click',() => {
        const val = +energy.value
        if(val === 10) return false
        energy.value = val + 1
        AxieEnergy()
    })

    const minus = document.querySelector('#minus');
    minus?.addEventListener('click',() => {
        const val = +energy.value
        if(val === 0) return false
        energy.value = val -1
        AxieEnergy()
    })

    const card = document.querySelector('#card')

    const plusCostZero = document.querySelector('#plusCost0');
    plusCostZero?.addEventListener('click',() => {
        if(+card.value === 0) return false
        const val = +card.value
        if(val === 0) return false
        card.value = val - 1
        AxieCard()
    })

    const plusCostOne = document.querySelector('#plusCost1');
    plusCostOne?.addEventListener('click',() => {

        if(+card.value === 0 || +energy.value === 0) return false
        card.value = +card.value - 1
        AxieCard()

        energy.value = +energy.value - 1
        AxieEnergy()
    })

    const plusCard = document.querySelector('#plusCard');
    plusCard?.addEventListener('click',() => {
        if(+card.value === 18) return false
        card.value = +card.value + 1
        AxieCard()
    })

    const minusCard = document.querySelector('#minusCard');
    minusCard?.addEventListener('click',() => {
        if(+card.value === 0) return false
        card.value = +card.value -1
        AxieCard()
    })

    EndTurn();
}

function InitAxieEnergy() {
    const contentElem = document.querySelector('.axie-content-energy')
    const cardElem = document.createElement("div");
    const energyElem =document.querySelector('#energy')
    cardElem.classList.add('axie-energy')
    cardElem.innerHTML = `<span> ${energyElem.value}/10 </span>`;
    contentElem.appendChild(cardElem);
}

function AxieEnergy() {
    const energy = document.querySelector('.axie-energy')
    const energyElem =document.querySelector('#energy')
    energy.innerHTML = `<span> ${energyElem.value}/10 </span>`;

}

function AxieCard () {
    const contentElem = document.querySelector('.axie-content-card')
    const card = document.querySelector('#card')
    
    document.querySelectorAll('.axie-card').forEach(e => e.remove());

    // if(+card.value === 0) {
    //     contentElem.style.height = "2.8em";
    //     contentElem.classList.add('hidden')
    // }
    // else {
    //     contentElem.style.height = "unset";
    //     contentElem.classList.remove('hidden')
    // }

    for(let i = 1; i <= +card.value; i++) {
        const cardElem = document.createElement("div");
        cardElem.classList.add('axie-card')
        cardElem.innerHTML = `<span> ${i} </span>`;
        contentElem.appendChild(cardElem);
    }
}

function InitAxieCard () {
    const contentElem = document.querySelector('.axie-content-card')
    for(let i = 1; i <= 6; i++) {
        const cardElem = document.createElement("div");
        cardElem.classList.add('axie-card')
        cardElem.innerHTML = `<span> ${i} </span>`;
        contentElem.appendChild(cardElem);
    }
}

export function run () {
    const form = document.querySelector('form')
    form.addEventListener('submit',onSubmit);

    const clone  = document.querySelector('#btn-clone')
    clone?.addEventListener('click',onClone) 
    const removeClone  = document.querySelector('#btn-remove-clone')
    removeClone?.addEventListener('click',onRemoveClone) 

    const reset  = document.querySelector('#reset')
    reset?.addEventListener('click', () => {
        location.reload()
    }) 

    const axie = document.querySelector('#axie')

    axie.addEventListener('change',() => {
        const classNames = document.getElementsByName("classCard")

        for(let i = 0; i < classNames.length; i++) {
            const elem = classNames[i]
            elem.value = axie.value
        }
    })

    const atkupCards = document.querySelectorAll('.atkupCard')

    for(let i = 0; i < atkupCards.length; i++) {
        const elem = atkupCards[i]
        const regex = /[^\d,]|\.(?=.*\.)/g;

        elem.addEventListener('keyup',(e) => {
            const str=e.target.value;
            const result = str.replace(regex, '');
            e.target.value=result;
        })
    }
    CountAnythings()
    InitAxieEnergy()
    InitAxieCard()
}