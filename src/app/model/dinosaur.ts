import { showAlert, showAlertError } from "../tools/message-functions";

export class Dinosaur {

  static jsonDinoExample =
    `{
       "sede": "Alonso Ovalle",
"idAsignatura": "PGY4121",
"seccion": "001D",
"nombreAsignatura": "Aplicaciones Móviles",
"nombreProfesor": "Cristián Gómez Vega",
"dia": "2022-08-09",
"bloqueInicio": 7,
"bloqueTermino": 9,
"horaInicio": "13:00",
"horaFin": "15:15" 
    }`;
  
    static jsonDinoEmpty =
    `{
      "sede": "",
      "idAsignatura": "",
      "seccion": "",
      "nombreAsignatura": "",
      "nombreProfesor": "",
      "dia": "",
      "bloqueInicio": "",
      "bloqueTermino": "",
      "horaInicio": "",
      "horaFin": "15:15"

    }`;

   sede = '';
   idAsignatura = '';
   seccion = '';
   nombreAsignatura = '';
   nombreProfesor = '';
   dia = '';
   bloqueInicio = '';
   bloqueTermino = '';
   horaInicio = '';
   horaFin = '';

  constructor() { }

  public static getNewDinosaur(
    sede: string,
    idAsignatura: string,
    seccion: string,
    nombreAsignatura: string,
    nombreProfesor: string,
    dia: string,
    bloqueInicio: string,
    bloqueTermino: string,
    horaInicio: string,
    horaFin: string

  ) {
    const dino = new Dinosaur();
    dino.sede = sede;
    dino.idAsignatura = idAsignatura;
    dino.seccion = seccion;
    dino.nombreAsignatura = nombreAsignatura;
    dino.nombreProfesor = nombreProfesor;
    dino.dia = dia;
    dino.bloqueInicio = bloqueInicio;
    dino.bloqueTermino = bloqueTermino;
    dino.horaInicio = horaInicio;
    dino.horaFin = horaFin;
    return dino;
  }

  // Devolver verdadero si el texto del QR contiene todos los datos de
  // un dinosaurio, de lo contrario se ha escaneado un QR que a lo 
  // mejor es válido, pero es de otra cosa que no es un dinosaurio
  // de esta aplicación.

  static isValidDinosaurQrCode(qr: string) {
    
    if (qr === '') return false;

    try {
      const json = JSON.parse(qr);

      if ( json.sede       !== undefined
        && json.idAsignatura     !== undefined
        && json.seccion     !== undefined
        && json.nombreAsignatura     !== undefined
        && json.nombreProfesor       !== undefined
        && json.dia     !== undefined
        && json.bloqueInicio !== undefined
        && json.bloqueTermino      !== undefined
        && json.horaInicio      !== undefined
        && json.horaFin      !== undefined)
      {
        return true;
      }
    } catch(error) { }

    showAlert('El código QR escaneado no corresponde a un dinosaurio');
    return false;
  }
  
}
