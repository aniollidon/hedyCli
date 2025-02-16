const higlitingHedyErrors = {
    "hy-identation": {
        message:
        "La identació no és correcta. Després d'un bucle o condició cal indentar. només en aquests casos.\n" +
        "Recorda que has de ser consistent amb la indentació, cal mantenir sempre la mateixa quantitat d'espais per nivell",
        severity: "error",
    },
    "hy-identation-multiple-unavailable": {
        message: "En aquest nivell encara no es pot definir un bucle/condició dins un altre bucle/condició. només es permeten bucles/condicions independents",
        severity: "error",
    },
    "hy-context": {
        message: "La comanda '[NAME]' no es pot fer servir en aquest context",
        severity: "error",
    },
    "hy-at-begining": {
        message: "La comanda '[NAME]' ha d'anar al començament",
        severity: "error",
    },
    'hy-level-unavailable-yet': {
        message: "La comanda '[NAME]' encara no es pot fer servir en aquest nivell",
        severity: "error",
    },
    'hy-level-unavailable-deprecated': {
        message: "La comanda '[NAME]' ja no es pot fer servir en aquest nivell",
        severity: "error",
    },
    'hy-to-lowercase-command': {
        message: "Potser volies utilitzar la comanda '[LOWER]'?, si és així ha d'estar tota en minúscules",
        severity: "warning",
    },
    "hy-turn-left-right": {
        message: "La comanda '[NAME]' només accepta 'left' o 'right' en aquest nivell",
        severity: "error",
    },
    "hy-unnecessary-quotes": {
        message: "En aquest nivell no calen cometes pels textos",
        severity: "info",
    },
    "hy-variabledef-multiplewords": {
        message: "Per definir una variable només pots fer servir una paraula",
        severity: "error",
    },
    "hy-recomended-equal": {
        message: "És més recomanable fer servir '=' enlloc de 'is'.",
        severity: "info",
    },
    "hy-after-needs-list": {
        message: "Després de '[NAME]' cal una llista",
        severity: "warning",
    },
    "hy-before-needs-list": {
        message: "Abans de '[NAME]' cal una llista",
        severity: "warning",
    },
    "hy-after-needs-nolist": {
        message: "Després de '[NAME]' no pot haver-hi una llista",
        severity: "warning",
    },
    "hy-before-needs-nolist": {
        message: "Abans de '[NAME]' no pot haver-hi una llista",
        severity: "warning",
    },
    "hy-cant-print-list": {
        message: "Les llistes no es poden imprimir directament",
        severity: "warning",
    },
    "hy-add-remove-notlist": {
        message: "El format correcte és 'add <item> to <llista>' o 'remove <item> from <llista>'. No pot haver-hi una llista al lloc de l'item.",
        severity: "warning",
    },
    "hy-else-elif-needs-if": {
        message: "La comanda '[NAME]' espera que s'hagi usat 'if' anteriorment",
        severity: "error",
    },
    "hy-recomended-equalequal": {
        message: "En aquest nivell ja es pot fer servir '==' enlloc de '[NAME]'",
        severity: "info",
    },
    "hy-same-comparison": {
        message: "No té massa sentit comparar dos cops el mateix",
        severity: "warning",
    },
    "hy-text-must-be-quoted":{
        message: "Aquest text hauria d'anar entre cometes.",
        severity: "error",
    },
    "hy-not-decimals": {
        message: "En aquest nivell els decimals encara no estan permesos",
        severity: "error",
    },
    "hy-blanks-not-allowed": {
        message: "Els espais en blanc s'han d'omplir amb codi!",
        severity: "error",
    },
    "hy-lines-must-start-with": {
        message: "Les línies han de començar amb una comanda o una definició",
        severity: "error",
    },
    "hy-command-missing-argument":{
        message: "La comanda '[NAME]' necessita un valor després",
        messagePlural: "La comanda '[NAME]' necessita [VALUE] arguments",
        messageZero: "La comanda '[NAME]' no necessita arguments",
        severity: "error",
    },
    "hy-command-unexpected-argument":{
        message: "La comanda '[NAME]' només accepta un argument",
        messagePlural: "La comanda '[NAME]' només accepta [VALUE] arguments",
        messageZero: "La comanda '[NAME]' no accepta cap valor després",
        severity: "error",
    },
    "hy-execting-number":{
        message: "La comanda '[NAME]' espera un número",
        severity: "error",
    }
};


class HHError {
    constructor(onText, errorCode, start, end, value=undefined) {
        this.onText = onText;
        this.errorCode = errorCode;
        this.start = start;
        this.end = end;
        this.value = value;
    }

    getMessage() {
        let message = higlitingHedyErrors[this.errorCode].message;
        if(this.value !== undefined) {
            if(this.value === 0) {
                message = higlitingHedyErrors[this.errorCode].messageZero;
            } else if(this.value > 1) {
                message = higlitingHedyErrors[this.errorCode].messagePlural;
            }
            message = message.replace("[VALUE]", this.value);
        }
        message = message.replace("[NAME]", this.onText);
        message = message.replace("[LOWER]", this.onText.toLowerCase());
        return message;
    }

    get() {
        return {
            message: this.getMessage(),
            start: this.start,
            end: this.end,
            codeerror: this.errorCode,
            severity: higlitingHedyErrors[this.errorCode].severity
        }
    }
}

module.exports = {
    HHError
};