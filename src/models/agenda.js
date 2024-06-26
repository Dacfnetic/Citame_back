class Agenda {
  constructor() {
    this.lun = []
    this.ma = []
    this.mie = []
    this.jue = []
    this.vie = []
    this.sab = []
    this.dom = []
    this.diasConCitas = {}
  }

  construirHorarioInicial(horario) {
    const horarioJson = horario

    this.lun = horarioJson.lunes.map((h) => {
      const hinicial = h.hora_inicial + h.minuto_inicial / 60
      const hfinal = h.hora_final + h.minuto_final / 60
      return { HoraInicial: hinicial, HoraFinal: hfinal }
    })
    this.ma = horarioJson.martes.map((h) => {
      const hinicial = h.hora_inicial + h.minuto_inicial / 60
      const hfinal = h.hora_final + h.minuto_final / 60
      return { HoraInicial: hinicial, HoraFinal: hfinal }
    })
    this.mie = horarioJson.miercoles.map((h) => {
      const hinicial = h.hora_inicial + h.minuto_inicial / 60
      const hfinal = h.hora_final + h.minuto_final / 60
      return { HoraInicial: hinicial, HoraFinal: hfinal }
    })
    this.jue = horarioJson.jueves.map((h) => {
      const hinicial = h.hora_inicial + h.minuto_inicial / 60
      const hfinal = h.hora_final + h.minuto_final / 60
      return { HoraInicial: hinicial, HoraFinal: hfinal }
    })
    this.vie = horarioJson.viernes.map((h) => {
      const hinicial = h.hora_inicial + h.minuto_inicial / 60
      const hfinal = h.hora_final + h.minuto_final / 60
      return { HoraInicial: hinicial, HoraFinal: hfinal }
    })
    this.sab = horarioJson.sabado.map((h) => {
      const hinicial = h.hora_inicial + h.minuto_inicial / 60
      const hfinal = h.hora_final + h.minuto_final / 60
      return { HoraInicial: hinicial, HoraFinal: hfinal }
    })
    this.dom = horarioJson.domingo.map((h) => {
      const hinicial = h.hora_inicial + h.minuto_inicial / 60
      const hfinal = h.hora_final + h.minuto_final / 60
      return { HoraInicial: hinicial, HoraFinal: hfinal }
    })
    this.diasConCitas = {}
  }

  establecerHorarios(objeto) {
    this.lun = objeto['lun']
    this.ma = objeto['ma']
    this.mie = objeto['mie']
    this.jue = objeto['jue']
    this.vie = objeto['vie']
    this.sab = objeto['sab']
    this.dom = objeto['dom']
    this.diasConCitas = objeto['diasConCitas']
  }

  agregarDiaNoDisponible(dia) {
    this.diaNoDisponible.push(dia)
  }

  //Metodo restar cita para horario disponible

  updateWorkerHorario(citaJson, idCita) {
    const cita = citaJson
    const fecha = `${cita.dia}/${cita.mes}/${cita.year}`
    let horarioD = []

    if (!this.diasConCitas.hasOwnProperty(fecha)) {
      this.diasConCitas[fecha] = {}
    }

    let fechaFront = new Date(cita.year, cita.mes - 1, cita.dia)
    const dia = fechaFront.getDay() //obtener fecha con getDate
    switch (dia) {
      case 1:
        horarioD = [...this.lun]

        break

      case 2:
        horarioD = [...this.ma]

        break

      case 3:
        horarioD = [...this.mie]

        break
      case 4:
        horarioD = [...this.jue]

        break
      case 5:
        horarioD = [...this.vie]

        break
      case 6:
        horarioD = [...this.sab]

        break
      case 0:
        horarioD = [...this.dom]

        break

      default:
        break
    }

    const horaInicio = cita.hora_inicial + cita.minuto_inicial / 60
    const horaFinal = cita.hora_final + cita.minuto_final / 60

    const indexH = horarioD.findIndex(
      (horaD) => horaD.HoraInicial <= horaInicio && horaD.HoraFinal >= horaFinal,
    )

    let intersecciones = 0
    for (const propiedad in this.diasConCitas[fecha]) {
      const date = this.diasConCitas[fecha];
      console.log(date[propiedad]['horaInicio'] );
      if (
        !(
          (date[propiedad]['horaInicio'] > horaInicio &&
          date[propiedad]['horaInicio'] > horaFinal &&
            date[propiedad]['horaFinal'] >= horaInicio &&
            date[propiedad]['horaFinal'] >= horaFinal) ||
          (date[propiedad]['horaInicio'] < horaInicio &&
            date[propiedad]['horaInicio'] < horaFinal &&
            date[propiedad]['horaFinal'] <= horaInicio &&
            date[propiedad]['horaFinal'] <= horaFinal)
        )
      ) {
        intersecciones++
      }
    }

    if (indexH === -1 && intersecciones > 0) {
      console.log('Horario no disponible')
      return false
    }

    this.diasConCitas[fecha][idCita] = {
      horaInicio: horaInicio,
      horaFinal: horaFinal,
    }

    return true
  }

  deniedCitaWorkerHorario(idCita) {
    //const cita = citaJson;
    //const fecha = `${cita.dia}/${cita.mes}/${cita.year}`
    //let index = this.diasConCitas.findIndex((dia) => dia.fecha === fecha)
    //let horarioD = []

    if (index === -1) {
      let fechaFront = new Date(cita.year, cita.mes - 1, cita.dia)
      const dia = fechaFront.getDay() //obtener fecha con getDate

      switch (dia) {
        case 1:
          horarioD = [...this.lun]

          break

        case 2:
          horarioD = [...this.ma]

          break

        case 3:
          horarioD = [...this.mie]

          break
        case 4:
          horarioD = [...this.jue]

          break
        case 5:
          horarioD = [...this.vie]

          break
        case 6:
          horarioD = [...this.sab]

          break
        case 0:
          horarioD = [...this.dom]

          break

        default:
          break
      }

      this.diasConCitas.push({ fecha: fecha, HorarioDisp: horarioD })
    } else {
      horarioD = this.diasConCitas[index].HorarioDisp
    }
    index = this.diasConCitas.findIndex((dia) => dia.fecha === fecha)

    const horaInicio = cita.hora_inicial + cita.minuto_inicial / 60
    const horaFinal = cita.hora_final + cita.minuto_final / 60
    const indexH = this.diasConCitas[index].HorarioDisp.findIndex(
      (horaD) => horaD.HoraInicial <= horaInicio && horaD.HoraFinal >= horaFinal,
    )

    if (indexH === -1) {
      console.log('Horario no disponible')
      return false
    }

    const horario1A = this.diasConCitas[index].HorarioDisp[indexH].HoraInicial
    const horario2A = horaInicio

    const horarioA = { HoraInicial: horario1A, HoraFinal: horario2A, idCita: idCita }

    const horario1B = horaFinal
    const horario2B = this.diasConCitas[index].HorarioDisp[indexH].HoraFinal

    const horarioB = { HoraInicial: horario1B, HoraFinal: horario2B, idCita: idCita }

    // if (horarioinicial del indice del horario disponible es menor que el horario de inicio && el horario final del indice del horario disponible es mayor que el horario final){

    this.diasConCitas[index].HorarioDisp.splice(indexH, 1, horarioA, horarioB)

    return true
  }
}

module.exports = Agenda
