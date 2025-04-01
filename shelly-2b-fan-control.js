/* Configuration dans l'application pour chaque couple entrée/sortie :  
- Sélectionner le bouton d'entrée/le mode de l'interrupteur  
  Interrupteur  
- Définir le type de relais  
  Régler le dispositif Shelly pour qu'il soit en mode interrupteur "autonome"  
- Définir l'alimentation du relais par défaut  
  IO1 : Configurer le dispositif Shelly pour qu'il restaure le dernier mode dans lequel il se trouvait lorsqu'il est alimenté  
  Configuration réinitialisation  
  IO2 : Configurer le dispositif Shelly pour qu'il s'éteigne lorsqu'il est alimenté  
- Décocher "Activation de la réinitialisation à partir de l'entrée" : IO1 et IO2  

Factory reset by input est un moyen de restaurer les paramètres d'usine du dispositif et d'annuler toutes les modifications effectuées. Cette action est possible uniquement dans les 60 premières secondes après le démarrage. L'utilisateur doit basculer l'entrée 5 fois, et le dispositif sera réinitialisé à ses paramètres d'usine. La réinitialisation d'usine peut également être effectuée via un appel RPC.  

- Scripts  
  Cocher "Run on startup"  
*/

/* Inputs */
let LIGHT_INPUT_ID = 0;
let FAN_INPUT_ID = 1;
let LIGHT_INPUT_COMPONENT = "input:0";
let FAN_INPUT_COMPONENT = "input:1";

/* Outputs */
let FAN_OUPUT_ID = 0;

/* Others */
let shutOffFanTimer = null;
let NUM_OF_MINUTES = 30;

Shelly.addStatusHandler(function (e) {
    /* if fan switch is changed */
    if (e.component === FAN_INPUT_COMPONENT) {
        print("Fan switch: Off");
        /* if fan is turned off manually stop the timer! */
        if (e.delta.state === false) {
            /* if no timer */
            if (shutOffFanTimer == null) {
                turnOffFan();
            }
        } else {
            print("Fan switch: On");
            turnOnFan();
        }
    } else if (e.component === LIGHT_INPUT_COMPONENT) {
        turnOnFan();

        /* lumière éteinte */
        if (e.delta.state === false) {
            print("Light switch : Off");

            if (shutOffFanTimer === null) {
                /* prod */
                shutOffFanTimer = Timer.set(NUM_OF_MINUTES * 60 * 1000, false, turnOffFanAndStopTimer);
            }
        } else {
            print("Light switch : On");
        }
    }
});

function turnOffFanAndStopTimer() {
    print("Timer expired");
    /* find out the state of the fan */
    let fanSwitchOn = Shelly.getComponentStatus("input", FAN_INPUT_ID).state;
    let lightSwitchOn = Shelly.getComponentStatus("input", LIGHT_INPUT_ID).state;

    /* Stop only if we are in fan switch off(timer expired) or fanSwitch off */
    if ((fanSwitchOn === false) && (lightSwitchOn === false)) {
        turnOffFan();
    }
    stopTimer();
}

function turnOnFan() {
    Shelly.call("Switch.set", {
        'id': FAN_OUPUT_ID,
        'on': true
    });
}

function turnOffFan() {
    Shelly.call("Switch.set", {
        'id': FAN_OUPUT_ID,
        'on': false
    });
}

function stopTimer() {
    Timer.clear(shutOffFanTimer);
    shutOffFanTimer = null;
}
