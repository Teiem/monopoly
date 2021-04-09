class Player {
    name;

    money;
    properties = [];
    position = 0;
    playerEl;

    constructor({ name, money = 5000}) {
        this.name = name;
        this.money = money;

        this.playerEl = document.createElement("span");
        this.playerEl.innerText = "\n" + this.name;

        fields[0].node.appendChild(this.playerEl);
    }

    goTo(position) {
        fields[this.position].node.removeChild(this.playerEl);

        this.position = position % fieldCount;

        fields[position].node.appendChild(this.playerEl);
    }

    advance(count) {
        if (count >= fieldCount) this.addGoMoney();

        this.goTo(this.position + count)
    }

    addGoMoney() {
        this.money += 200;
        console.trace("added 200");
    }

    putInJail() {
        // TODO
        endTurn();
    }

    addMoney(amount) {
        console.log(amount > 0 ? "added" : "removed", Math.abs(amount));
        this.money += amount;

        if (this.money < 0) console.log("game over");
    }
}

class Field {
    name;

    constructor({ name, action = this.action }) {
        this.name = name;
        this.action = action;

        this.node = document.createElement("div");
        this.node.innerText = this.name;
        this.node.classList.add("field");

        main.appendChild(this.node);
    }

    action() {
        console.log("this field has no action");
    };
}

class Property extends Field {
    owner = null;
    price;
    isOnMortgage = false;

    constructor({ price, ...data }) {
        super(data)
        this.price = price;
    }

    buy(player) {
        this.owner = player;
        player.addMoney(-this.price);

        console.log(`${player.name} hat ${this.name} für ${this.price} gekauft`);
    }

    takeOutMortgage() {
        this.isOnMortgage = true;
        this.owner.money += this.price / 2;
    }

    payOffMortgage() {
        this.isOnMortgage = false;
        this.owner.money -= this.price / 2 * 1.1;
    }

    ownsAllOfType(type) {

    }

    action(player, diceSum) {
        if (this.owner) {
            this.payRent(player, diceSum);

        } else {
            console.log("dieses Feld kann gekauft werden");
            interactBoolean({
                text: `möchtest du ${this.name} für ${this.price} kaufen?`,
                yes: () => this.buy(player),
                no: () => {},
                then: endTurn,
            })
        }
    }
}

class Street extends Property {
    houseCount = 0;
    houseCost;
    rentPrices;
    color;

    constructor({ houseCost, rentPrices, color, ...data }) {
        super({ ...data });

        this.houseCost = houseCost;
        this.rentPrices = rentPrices;
        this.color = color;

        this.node.style.backgroundColor = this.color;


        // todo add actual data
        this.rentPrices = [1, 2, 3, 4, 5, 6];
    }

    buildHouse(count) {
        this.houseCount += count;
        this.owner.money -= count * this.houseCount;
    }

    payRent(player) {
        this.owner.addMoney(this.rentPrices[this.houseCount]);
        player.addMoney(-this.rentPrices[this.houseCount]);

        console.log(`${player.name} payed ${this.owner.name} ${this.rentPrices[this.houseCount]}`);

        endTurn();
    }
}

class Utility extends Property {
    constructor({ ...data }) {
        super({ ...data, price: 150 });
    }

    payRent(player, diceSum) {
        const hasAllOfType = fields.some(field => field.constructor.name === this.constructor.name && field.owner !== this.owner);
        if (hasAllOfType) console.log(`since ${this.owner.name} has all Utilitys the rent is increased`);

        const rent = hasAllOfType ? diceSum * 10 : diceSum * 4;

        this.owner.addMoney(rent);
        player.addMoney(-rent);

        console.log(`${player.name} payed ${this.owner.name} ${rent}`);

        endTurn();
    }
}

class TrainStation extends Property {
    constructor({ ...data }) {
        super({ ...data, price: 200 });
    }

    payRent(player) {
        const countOfType = fields.filter(field => field.constructor.name === this.constructor.name && field.owner === this.owner).length;
        if (countOfType) console.log(`since ${this.owner.name} has ${countOfType} Trainstations the rent is increased`);

        const rent = countOfType * 50;

        this.owner.addMoney(rent);
        player.addMoney(-rent);

        console.log(`${player.name} payed ${this.owner.name} ${rent}`);

        endTurn();
    }
}

const main = document.getElementById("main");

const fields = [
    new Field({
        name: "Los",
        action: () => {
            getCurrentPlayer().addGoMoney();
            endTurn();
        },
    }),

    new Street({
        name: "Badstraße",
        price: 60,
        color: "brown"
    }),

    new Field({
        name: "Gemeinschaftsfeld",
        action: () => {
            getCurrentPlayer().addMoney(100);
            endTurn();
        },
    }),

    new Street({
        name: "Turmstraße",
        price: 60,
        color: "brown"
    }),

    new Field({
        name: "Einkommenssteuer",
        action: () => {
            getCurrentPlayer().addMoney(-100);
            endTurn();
        },
    }),

    new TrainStation({
        name: "Südbahnhof"
    }),

    new Street({
        name: "Chausseestraße",
        price: 100,
        color: "lightblue"
    }),

    new Field({
        name: "Ereignisfeldissfeld",
        action: () => {
            getCurrentPlayer().addMoney(100);
            endTurn();
        },
    }),

    new Street({
        name: "Elisenstraße",
        price: 100,
        color: "lightblue"
    }),

    new Street({
        name: "Poststraße",
        price: 120,
        color: "lightblue"
    }),



    new Field({
        name: "Gefängnis",
        action: () => endTurn(),
    }),

    new Street({
        name: "Seestraße",
        price: 140,
        color: "pink"
    }),

    new Street({
        name: "Hafenstraße",
        price: 140,
        color: "pink"
    }),

    new Utility({
        name: "Elektrizitätswerk"
    }),

    new Street({
        name: "Neue Straße",
        price: 160,
        color: "pink"
    }),

    new Street({
        name: "Münchner Straße",
        price: 180,
        color: "orange"
    }),

    new TrainStation({
        name: "Westbahnhof"
    }),

    new Street({
        name: "Wiener Straße",
        price: 180,
        color: "orange"
    }),

    new Field({
        name: "Gemeinschaftsfeld",
        action: () => {
            getCurrentPlayer().addMoney(100);
            endTurn();
        },
    }),

    new Street({
        name: "Berliner Straße",
        price: 200,
        color: "orange"
    }),



    new Field({
        name: "Frei Parken",
        action: () => endTurn(),
    }),

    new Street({
        name: "Theaterstraße",
        price: 220,
        color: "red"
    }),

    new Field({
        name: "Ereignisfeldissfeld",
        action: () => {
            getCurrentPlayer().addMoney(100);
            endTurn();
        },
    }),

    new Street({
        name: "Museumstraße",
        price: 220,
        color: "red"
    }),

    new Street({
        name: "Opernplatz",
        price: 240,
        color: "red"
    }),

    new TrainStation({
        name: "Nordbahnhof"
    }),

    new Street({
        name: "Lessingstraße",
        price: 260,
        color: "yellow"
    }),

    new Street({
        name: "Schillerstraße",
        price: 260,
        color: "yellow"
    }),

    new Utility({
        name: "Wasserwerk"
    }),

    new Street({
        name: "Goethestraße",
        price: 280,
        color: "yellow"
    }),



    new Field({
        name: "Geh ins Gefängnis",
        action: () => getCurrentPlayer().putInJail(),
    }),

    new Street({
        name: "Rathausplatz",
        price: 300,
        color: "green"
    }),

    new Street({
        name: "Hauptstraße",
        price: 300,
        color: "green"
    }),

    new Field({
        name: "Gemeinschaftsfeld",
        action: () => {
            getCurrentPlayer().addMoney(100);
            endTurn();
        },
    }),

    new Street({
        name: "Bahnhofstraße",
        price: 320,
        color: "green"
    }),

    new TrainStation({
        name: "Hauptbahnhof"
    }),

    new Field({
        name: "Ereignisfeldissfeld",
        action: () => {
            getCurrentPlayer().addMoney(100);
            endTurn();
        },
    }),

    new Street({
        name: "Parkstraße",
        price: 350,
        color: "darkblue"
    }),

    new Field({
        name: "Zusatzsteuer",
        action: () => {
            getCurrentPlayer().addMoney(-100);
            endTurn();
        },
    }),

    new Street({
        name: "Schlossallee",
        price: 400,
        color: "darkblue"
    }),
];


fields.forEach((field, i) => field.node.setAttribute("data-area", i))


const fieldCount = fields.length;


const [textEl, yesEl, noEl] = document.getElementById("interactable").children;
const interactBoolean = ({ text, yes, no, then }) => {
    textEl.parentElement.style.display = "block";

    textEl.innerText = text;

    yesEl.onclick = () => {
        textEl.parentElement.style.display = "none";
        yes?.();
        then();
    };
    noEl.onclick = () => {
        textEl.parentElement.style.display = "none";
        no?.();
        then();
    };
};
// const interact = () => {};


const rollDice = () => Math.floor(Math.random() * 6) + 1;

const players = [
    new Player({ name: "player 1"}),
    new Player({ name: "player 2"}),
    new Player({ name: "player 3"}),
    new Player({ name: "player 4"})
];

const getCurrentPlayer = () => players[turnIndex % players.length];
let turnIndex = 0;

const takeTurn = () => {
    const currentPlayer = getCurrentPlayer();

    console.log(`${currentPlayer.name} ist am Zug`);
    const dice1 = rollDice();
    const dice2 = rollDice();

    console.log(`${currentPlayer.name} rolled a ${dice1} and a ${dice2}`);

    currentPlayer.advance(dice1 + dice2);

    console.log(`and landed on ${fields[currentPlayer.position].name}`);

    fields[currentPlayer.position].action(currentPlayer, dice1 + dice2);
};

const endTurn = () => {
    turnIndex++;

    console.log("--------------------");
    takeTurn();
};

takeTurn();