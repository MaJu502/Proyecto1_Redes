/*
  Universidad de Valle de Guatemala
  Course: Redes - 2023
  Author: Marco Jurado
  Student ID: 20308
  About:
  Client for connecting to an XMPP server using a JS script with the ability to manage accounts.
*/

const { client, xml } = require("@xmpp/client"); // variables de xmpp

/* Se crea una función para permitir inputs async del usuario
   cuando se este usando el cliente. Esta función fue implementada
   con readline y posteriormente corregida y optimizada con la 
   ayuda de chat GPT. 
*/
const readline = require('readline');

const input = async (msg) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        return await new Promise((resolve) => rl.question(msg, resolve));
    } finally {
        rl.close();
    }
}




// Uso de la función
(async () => {
    const userInput = await input('Ingrese algo: ');
    console.log('Entrada del usuario:', userInput);
})();
