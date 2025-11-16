const API_URL = "http://localhost:3000/clientes";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

function imgOrPlaceholder(src) {
  if (!src || src.trim() === "") return "assets/img/veiculo1.jpg";
  return src;
}

async function carregarVeiculos() {
  try {
    const veiculos = await fetchJson(API_URL);
    const cardsContainer = document.getElementById("cardsContainer");
    const sliderContainer = document.getElementById("sliderDestaque");
    if (sliderContainer) sliderContainer.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";

    const destaques = veiculos.filter(v => v.destaque);
    destaques.forEach((v, idx) => {
      if (!sliderContainer) return;
      sliderContainer.innerHTML += `
        <div class="carousel-item ${idx === 0 ? "active" : ""}">
          <img src="${imgOrPlaceholder(v.imagem)}" class="d-block w-100" alt="${v.nome}">
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
            <h5>${v.nome}</h5>
            <p>${v.endereco || ""}</p>
            <a href="detalhe.html?id=${v.id}" class="btn btn-primary">Ver Detalhes</a>
          </div>
        </div>
      `;
    });

    veiculos.forEach(v => {
      if (!cardsContainer) return;
      cardsContainer.innerHTML += `
        <div class="col">
          <div class="card h-100">
            <img src="${imgOrPlaceholder(v.imagem)}" class="card-img-top" alt="${v.nome}">
            <div class="card-body">
              <h5 class="card-title">${v.nome}</h5>
              <p class="card-text">${v.endereco || ""}</p>
              <p class="card-text"><strong>Telefone:</strong> ${v.telefone || "-"}</p>
              <a href="detalhe.html?id=${v.id}" class="btn btn-primary me-2">Ver Detalhes</a>
              <button class="btn btn-danger" onclick="deletarVeiculo(${v.id})">Excluir</button>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("Erro ao carregar veículos:", err);
  }
}


async function carregarDetalhes() {
  const infoVeiculo = document.getElementById("infoVeiculo");
  if (!infoVeiculo) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    const v = await fetchJson(`${API_URL}/${id}`);
    infoVeiculo.innerHTML = `
      <h2 class="mb-3">${v.nome}</h2>
      <img src="${imgOrPlaceholder(v.imagem)}" class="img-fluid mb-3" alt="${v.nome}">
      <ul class="list-group">
        <li class="list-group-item"><strong>CPF:</strong> ${v.cpf}</li>
        <li class="list-group-item"><strong>E-mail:</strong> ${v.email}</li>
        <li class="list-group-item"><strong>Telefone:</strong> ${v.telefone}</li>
        <li class="list-group-item"><strong>Endereço:</strong> ${v.endereco}</li>
        <li class="list-group-item"><strong>Observações:</strong> ${v.observacoes}</li>
      </ul>
      <div class="mt-3">
        <button class="btn btn-warning" onclick="abrirEdicao(${v.id})">Editar</button>
        <button class="btn btn-danger" onclick="deletarVeiculo(${v.id})">Excluir</button>
      </div>
    `;
  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
  }
}

async function carregarListaClientes() {
  const lista = document.getElementById("listaClientes");
  if (!lista) return;
  try {
    const clientes = await fetchJson(API_URL);
    lista.innerHTML = "";
    clientes.forEach(c => {
      lista.innerHTML += `
        <div class="card client-card">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${imgOrPlaceholder(c.imagem)}" class="img-fluid client-img" alt="${c.nome}">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${c.nome}</h5>
                <p class="card-text">${c.email} • ${c.telefone}</p>
                <p class="card-text"><small class="text-muted">${c.endereco || ''}</small></p>
                <div class="client-actions">
                  <button class="btn btn-sm btn-outline-primary" onclick="abrirEdicao(${c.id})">Editar</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deletarVeiculo(${c.id})">Excluir</button>
                  <a class="btn btn-sm btn-primary" href="detalhe.html?id=${c.id}">Detalhes</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("Erro ao carregar lista de clientes:", err);
  }
}

async function cadastrarOuEditar(event) {
  event.preventDefault();
  const id = document.getElementById("clienteId").value;
  const cliente = {
    nome: document.getElementById("nome").value,
    cpf: document.getElementById("cpf").value,
    email: document.getElementById("email").value,
    telefone: document.getElementById("telefone").value,
    endereco: document.getElementById("endereco").value,
    observacoes: document.getElementById("observacoes").value,
    destaque: document.getElementById("destaque").checked,
    imagem: document.getElementById("imagem").value
  };

  try {
    if (id && id !== "") {
      await fetchJson(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cliente, id: Number(id) })
      });
      alert("Cliente atualizado com sucesso.");
    } else {
      await fetchJson(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
      });
      alert("Cliente cadastrado com sucesso.");
    }
   
    document.getElementById("formCadastro").reset();
    document.getElementById("clienteId").value = "";
    document.getElementById("btnSalvar").textContent = "Cadastrar";
    document.getElementById("btnCancelar").style.display = "none";
    carregarListaClientes();
  } catch (err) {
    console.error("Erro ao salvar cliente:", err);
  }
}

async function abrirEdicao(id) {
  try {
    const v = await fetchJson(`${API_URL}/${id}`);
    document.getElementById("clienteId").value = v.id;
    document.getElementById("nome").value = v.nome || "";
    document.getElementById("cpf").value = v.cpf || "";
    document.getElementById("email").value = v.email || "";
    document.getElementById("telefone").value = v.telefone || "";
    document.getElementById("endereco").value = v.endereco || "";
    document.getElementById("observacoes").value = v.observacoes || "";
    document.getElementById("destaque").checked = v.destaque || false;
    document.getElementById("imagem").value = v.imagem || "";
    document.getElementById("btnSalvar").textContent = "Salvar Alterações";
    document.getElementById("btnCancelar").style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Erro ao abrir edição:", err);
  }
}

function cancelarEdicao() {
  document.getElementById("formCadastro").reset();
  document.getElementById("clienteId").value = "";
  document.getElementById("btnSalvar").textContent = "Cadastrar";
  document.getElementById("btnCancelar").style.display = "none";
}


async function deletarVeiculo(id) {
  if (!confirm("Deseja realmente excluir este registro?")) return;
  try {
    await fetchJson(`${API_URL}/${id}`, { method: "DELETE" });
    alert("Registro excluído.");
    
    carregarListaClientes();
    carregarVeiculos();
 
    if (document.getElementById("infoVeiculo")) window.location.href = "index.html";
  } catch (err) {
    console.error("Erro ao deletar:", err);
  }
}


document.addEventListener("DOMContentLoaded", () => {

  if (document.getElementById("cardsContainer")) carregarVeiculos();

  if (document.getElementById("infoVeiculo")) carregarDetalhes();
 
  if (document.getElementById("formCadastro")) {
    carregarListaClientes();
    document.getElementById("formCadastro").addEventListener("submit", cadastrarOuEditar);
    document.getElementById("btnCancelar").addEventListener("click", cancelarEdicao);
  }
});

let clientes = JSON.parse(localStorage.getItem("clientes")) || [];


const ctxMeses = document.getElementById("graficoMeses");

if (ctxMeses) {
  let meses = {};
  
  clientes.forEach(c => {
    if (c.dataCadastro) {
      let mes = new Date(c.dataCadastro).getMonth() + 1;
      meses[mes] = (meses[mes] || 0) + 1;
    }
  });

  new Chart(ctxMeses, {
    type: "bar",
    data: {
      labels: Object.keys(meses),
      datasets: [{
        label: "Quantidade de Vistorias",
        data: Object.values(meses)
      }]
    }
  });
}


const ctxStatus = document.getElementById("graficoStatus");

if (ctxStatus) {
  let finalizados = clientes.filter(c => c.status === "Finalizado").length;
  let pendentes = clientes.length - finalizados;

  new Chart(ctxStatus, {
    type: "pie",
    data: {
      labels: ["Finalizados", "Pendentes"],
      datasets: [{
        data: [finalizados, pendentes]
      }]
    }
  });
}


const calendarioEl = document.getElementById("calendario");

if (calendarioEl) {
  const calendario = new FullCalendar.Calendar(calendarioEl, {
    initialView: "dayGridMonth",
    events: clientes.map(c => ({
      title: c.nome,
      date: c.dataCadastro
    }))
  });
  calendario.render();
}


document.getElementById("inputDestaques").addEventListener("change", function(event) {
    const files = event.target.files;
    const slider = document.getElementById("sliderDestaque");
    slider.innerHTML = ""; 

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const div = document.createElement("div");
            div.classList.add("carousel-item");
            if (index === 0) div.classList.add("active");

            div.innerHTML = `
                <img src="${e.target.result}" class="d-block w-100" style="max-height:400px; object-fit:cover;">
            `;

            slider.appendChild(div);
        };

        reader.readAsDataURL(file);
    });
});
