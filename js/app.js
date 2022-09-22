const formulario = document.getElementById('agregar-gasto');
const gastosListado = document.querySelector('#gastos ul');

eventListeners();
function eventListeners() {
  document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
  formulario.addEventListener('submit', agregarGasto);
  gastosListado.addEventListener('click', eliminarGasto);
}

class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter(gasto => gasto.id.toString() !== id);
    this.calcularRestante();
  }

  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - gastado;
  }
}

class UI {
  insertarPresupuesto(cantidad) {
    document.querySelector('#total').textContent = cantidad.presupuesto;
    document.querySelector('#restante').textContent = cantidad.restante;
  }

  imprimirAlerta(mensaje, tipo) {
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('text-center', 'alert');

    if (tipo === 'error') {
      divMensaje.classList.add('alert-danger');
    } else {
      divMensaje.classList.add('alert-success');
    }

    divMensaje.textContent = mensaje;

    document.querySelector('.primario').insertBefore(divMensaje, formulario);

    setTimeout(() => {
      document.querySelector('.primario .alert').remove();
    }, 3000);
  }

  agregarGastoListado(gastos) {
    this.limpiarHTML();

    gastos.forEach(gasto => {
      const {nombre, cantidad, id} = gasto;

      const nuevoGasto = document.createElement('li');
      nuevoGasto.className =
        'list-group-item d-flex justify-content-between align-items-center';
      nuevoGasto.dataset.id = id;

      nuevoGasto.innerHTML = `
                ${nombre}
                <span class="badge badge-primary badge-pill">$ ${cantidad}</span>
            `;

      const btnBorrar = document.createElement('button');
      btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
      btnBorrar.textContent = 'Apagar';
      nuevoGasto.appendChild(btnBorrar);

      gastosListado.appendChild(nuevoGasto);
    });
  }

  actualizarRestante(restante) {
    document.querySelector('span#restante').textContent = restante;
  }

  comprobarPresupuesto(presupuestoObj) {
    const {presupuesto, restante} = presupuestoObj;
    const restanteDiv = document.querySelector('.restante');

    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove('alert-success', 'alert-warning');
      restanteDiv.classList.add('alert-danger');
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove('alert-success');
      restanteDiv.classList.add('alert-warning');
    } else {
      restanteDiv.classList.remove('alert-danger', 'alert-warning');
      restanteDiv.classList.add('alert-success');
    }

    if (restante <= 0) {
      ui.imprimirAlerta('Saldo insuficiente.', 'error');
      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }

  limpiarHTML() {
    while (gastosListado.firstChild) {
      gastosListado.removeChild(gastosListado.firstChild);
    }
  }
}

const ui = new UI();
let presupuesto;

function preguntarPresupuesto() {
  const presupuestoUsuario = prompt('Valor Financeiro disponível');

  if (
    presupuestoUsuario === '' ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    window.location.reload();
  }

  presupuesto = new Presupuesto(presupuestoUsuario);

  ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e) {
  e.preventDefault();

  const nombre = document.querySelector('#gasto').value;
  const cantidad = Number(document.querySelector('#cantidad').value);

  if (nombre === '' || cantidad === '') {
    ui.imprimirAlerta('Preencha todos os campos', 'error');
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta('Quantidade inválida', 'error');
  } else {
    const gasto = {nombre, cantidad, id: Date.now()};

    presupuesto.nuevoGasto(gasto);

    ui.imprimirAlerta('Correto', 'correto');

    const {gastos} = presupuesto;
    ui.agregarGastoListado(gastos);

    ui.comprobarPresupuesto(presupuesto);

    const {restante} = presupuesto;

    ui.actualizarRestante(restante);

    formulario.reset();
  }
}

function eliminarGasto(e) {
  if (e.target.classList.contains('borrar-gasto')) {
    const {id} = e.target.parentElement.dataset;
    presupuesto.eliminarGasto(id);

    ui.comprobarPresupuesto(presupuesto);

    const {restante} = presupuesto;
    ui.actualizarRestante(restante);

    e.target.parentElement.remove();
  }
}
