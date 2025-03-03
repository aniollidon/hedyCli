const higlitingHedyErrors = {
    "hy-context": {
        message: "La comanda '[NAME]' no es pot fer servir d'aquesta manera.",
        severity: "error",
        priority: 0,
    },
    "hy-recomended-equal": {
        message: "És més recomanable fer servir '=' enlloc de 'is'.",
        severity: "info",
        priority: 0,
    },
    "hy-lines-must-start-with": {
        message: "Les línies han de començar amb una comanda o una definició.",
        severity: "error",
        priority: 0,
    },
    "hy-recomended-equalequal": {
        message: "En aquest nivell ja es pot fer servir '==' enlloc de '[NAME]'.",
        severity: "info",
        priority: 0,
    },
    "hy-entity-changes-content-type": {
        message: "Vigila que la variable '[NAME]' ha canviat el tipus a respecte la seva definició a la línia [LINE].",
        severity: "warning",
        priority: 0,
    },
    "hy-at-begining": {
        message: "La comanda '[NAME]' ha d'anar al començament.",
        severity: "error",
        priority: 1,
    },
    "hy-command-missing-argument": {
        message: "La comanda '[NAME]' necessita almenys un argument després.",
        messagePlural: "La comanda '[NAME]' necessita [VALUE] arguments després.",
        messageZero: "La comanda '[NAME]' no necessita arguments.",
        severity: "error",
        priority: 1,
    },
    "hy-command-missing-argument-before": {
        message: "La comanda '[NAME]' necessita un argument abans.",
        messagePlural: "La comanda '[NAME]' necessita [VALUE] arguments abans.",
        messageZero: "La comanda '[NAME]' no necessita arguments abans.",
        severity: "error",
        priority: 1,
    },
    "hy-command-unexpected-argument": {
        message: "La comanda '[NAME]' només accepta un argument després.",
        messagePlural: "La comanda '[NAME]' només accepta [VALUE] arguments després.",
        messageZero: "La comanda '[NAME]' no accepta cap valor després.",
        severity: "error",
        priority: 1,
    },
    "hy-command-unexpected-argument-conditional": {
        message: "La comanda '[NAME]' només accepta una condició després.",
        severity: "error",
        priority: 1,
    },
    "hy-command-missing-argument-comma": {
        message: "Després d'una coma hi ha d'haver un element.",
        severity: "error",
        priority: 1,
    },
    "hy-level-unavailable-yet": {
        message: "La comanda '[NAME]' encara no es pot fer servir en aquest nivell.",
        severity: "error",
        priority: 2,
    },
    "hy-level-unavailable-deprecated": {
        message: "La comanda '[NAME]' ja no es pot fer servir en aquest nivell.",
        severity: "error",
        priority: 2,
    },
    "hy-to-lowercase-command": {
        message: "Potser volies utilitzar la comanda '[LOWER]'?, si és així ha d'estar tota en minúscules.",
        severity: "warning",
        priority: 3,
    },
    "hy-text-must-be-quoted": {
        message: "Aquest text hauria d'anar entre cometes.",
        severity: "error",
        priority: 3,
    },
    "hy-entity-out-of-scope": {
        message: "La variable '[NAME]' s'està usant fora del seu bloc d'identació. La variable s'ha definit a la línia [LINE] que és fora del bloc actual.",
        severity: "warning",
        priority: 5,
    },
     "hy-always-false":{
        message: "La condició sempre és falsa i mai es compleix.",
        severity: "warning",
        priority: 5,
    },
    "hy-always-true":{
        message: "La condició sempre és certa i sempre es compleix.",
        severity: "warning",
        priority: 5,
    },
    "hy-same-comparison-true": {
        message: "No té massa sentit comparar dos cops el mateix. Sempre serà cert.",
        severity: "warning",
        priority: 6,
    },
    "hy-same-comparison-false": {
        message: "No té massa sentit comparar dos cops el mateix. Sempre serà fals.",
        severity: "warning",
        priority: 6,
    },
    "hy-execting-same-type": {
        message: "La comanda '[NAME]' espera el mateix tipus abans i després.",
        severity: "warning",
        priority: 6,
    },
    "hy-execting-number": {
        message: "La comanda '[NAME]' espera un número. [TYPE-FOUND].",
        severity: "error",
        priority: 10,
    },
    "hy-execting-number-integer": {
        message: "La comanda '[NAME]' espera un número enter. [TYPE-FOUND].",
        severity: "error",
        priority: 10,
    },
    "hy-execting-command-times": {
        message: "La comanda '[NAME]' espera un número enter i després la comanda 'times'. [TYPE-FOUND] a la segona posició.",
        severity: "error",
        priority: 10,
    },
    "hy-execting-number-string": {
        message: "La comanda '[NAME]' espera un número o text. [TYPE-FOUND].",
        severity: "error",
        priority: 10,
    },
    "hy-execting-number-note": {
        message: "La comanda '[NAME]' espera una nota o un número. [TYPE-FOUND].",
        severity: "error",
        priority: 10,
    },
    "hy-execting-color": {
        message: "La comanda '[NAME]' espera un color. [TYPE-FOUND].",
        severity: "error",
        priority: 10,
    },
    "hy-execting-condition":{
        message: "La comanda '[NAME]' espera una condició després.",
        severity: "error",
        priority: 10,
    },
    "hy-use-elseif-instead":{
        message: "Si després d'un 'else' vols fer 'if', utilitza la comanda 'elif'.",
        severity: "warning",
        priority: 10,
    },
    "hy-after-needs-list": {
        message: "Després de '[NAME]' cal una llista.",
        severity: "warning",
        priority: 50,
    },
    "hy-before-needs-list": {
        message: "Abans de '[NAME]' cal una llista.",
        severity: "warning",
        priority: 50,
    },
    "hy-after-needs-nolist": {
        message: "Després de '[NAME]' no pot haver-hi una llista.",
        severity: "warning",
        priority: 50,
    },
    "hy-before-needs-nolist": {
        message: "Abans de '[NAME]' no pot haver-hi una llista.",
        severity: "warning",
        priority: 50,
    },
    "hy-cant-print-list": {
        message: "Les llistes no es poden imprimir directament.",
        severity: "warning",
        priority: 50,
    },
    "hy-add-remove-notlist": {
        message: "El format correcte és 'add <item> to <llista>' o 'remove <item> from <llista>'. No pot haver-hi una llista al lloc de l'item.",
        severity: "warning",
        priority: 50,
    },
    "hy-pressed-must-be-second": {
        message: "La comanda '[NAME]' ha d'anar en segona posició, després de 'is'.",
        severity: "warning",
        priority: 100,
    },
    "hy-turn-left-right": {
        message: "La comanda '[NAME]' només accepta 'left' o 'right' en aquest nivell.",
        severity: "error",
        priority: 100,
    },
    "hy-variabledef-multiplewords": {
        message: "Per definir una variable només pots fer servir una paraula.",
        severity: "error",
        priority: 100,
    },
    "hy-not-decimals": {
        message: "En aquest nivell els decimals encara no estan permesos.",
        severity: "error",
        priority: 100,
    },
    "hy-else-elif-needs-if": {
        message: "La comanda '[NAME]' espera que s'hagi usat 'if' anteriorment.",
        severity: "error",
        priority: 100,
    },
    "hy-blanks-not-allowed": {
        message: "Els espais en blanc s'han d'omplir amb codi!",
        severity: "error",
        priority: 255,
    },
    "hy-identation": {
        message: "La identació no és correcta. Després d'un bucle o condició cal indentar. només en aquests casos.\n" +
            "Recorda que has de ser consistent amb la indentació, cal mantenir sempre la mateixa quantitat d'espais per nivell.",
        severity: "error",
        priority: 255,
    },
    "hy-identation-multiple-unavailable": {
        message: "En aquest nivell encara no es pot definir un bucle/condició dins un altre bucle/condició. Només es permeten bucles/condicions independents.",
        severity: "error",
        priority: 255,
    },
    "hy-unnecessary-quotes": {
        message: "En aquest nivell encara no cal cometes per aquest text.",
        severity: "info",
        priority: 255,
    },
};


class HHError {
    constructor(onText, errorCode, start, end) {
        this.onText = onText;
        this.errorCode = errorCode;
        this.start = start;
        this.end = end;
        this.priority = higlitingHedyErrors[this.errorCode].priority;
    }

    getMessage() {
        let message = higlitingHedyErrors[this.errorCode].message;
        message = this._process_messsage(message);
        return message;
    }

    _process_messsage(message) {
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

class HHErrorVal extends HHError{
    constructor(onText, errorCode, start, end, value){
        super(onText, errorCode, start, end);
        this.value = value;
    }

    _process_messsage(message){
        if(this.value !== undefined) {
            if(this.value === 0) {
                message = higlitingHedyErrors[this.errorCode].messageZero;
            } else if(this.value > 1) {
                message = higlitingHedyErrors[this.errorCode].messagePlural;
            }
            message = message.replace("[VALUE]", this.value);
        }
        message = super._process_messsage(message);
        return message;
    }
}

class HHErrorType extends HHError{
    constructor(onText, errorCode, start, end, type){
        super(onText, errorCode, start, end);
        this.type = type;
    }

    _process_messsage(message){
        
        let tipus = this.type;
        if(this.type.startsWith("constant_number")) {
            if(this.type === "constant_number_decimal")
                tipus = "un número decimal";
            else 
                tipus = "un número enter";

        } else if(this.type.startsWith("constant_string_unquoted")) {
            tipus = "un text sense cometes";
        } else if(this.type.startsWith("constant_string_quoted")) {
            tipus = "un text";
        } else if(this.type.startsWith("constant_color")) {
            tipus = "un color";
        } else if(this.type.startsWith("constant_note")) {
            tipus = "una nota";
        } else if(this.type.startsWith("entity_variable_list")) {
            tipus = "una llista";
        } else if(this.type.startsWith("entity_variable_value")) {
            tipus = "una variable";
        }
        const extra = "S'ha trobat " + tipus;
        message = message.replace("[TYPE-FOUND]", extra);
        message = super._process_messsage(message);
        return message;
    }
}

class HHErrorLine extends HHError{
    constructor(onText, errorCode, start, end, lineNumber){
        super(onText, errorCode, start, end);
        this.lineNumber = lineNumber;
    }

    _process_messsage(message){
        message = message.replace("[LINE]", this.lineNumber+1);
        message = super._process_messsage(message);
        return message;
    }
}

module.exports = {
    HHError,
    HHErrorVal,
    HHErrorType,
    HHErrorLine
};