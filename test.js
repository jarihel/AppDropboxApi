console.log('Comenzando');
"use strict";
const state = { files: [], rootPath: '/inicio' }
const fileListElem = document.querySelector('.app')
const loadingElem = document.querySelector('.loading')
let ruta = new Set();
const dbx = new Dropbox.Dropbox({
  accessToken: 'hpJyzxIQD5AAAAAAAAAAMTt3hx8G3IU_DVrkMCohpRLvpHXkGedz0EjDubYfUudN',
  fetch
});
const init = async () => {
  //console.log(ruta);
  let res = await dbx.filesListFolder({
    path: state.rootPath,
    limit: 20
  })
  // console.log(res);
  updateFiles(res.entries); // acualiza el state y renderiza

  /*///////////////////////////////CARPETAS////////////////////////////////////////////////*/
  let carpetas = document.querySelectorAll('#path');//captura los items que son carpetas
  carpetas.forEach((elemento) => {
    elemento.addEventListener('click', (e) => {
      loadingElem.classList.remove('hidden')
      if (elemento.textContent.toLowerCase().includes(' ')) {
        console.log('Tiene un espacio');
        let nombre = elemento.textContent.toLowerCase().split(' ').join('__');
        console.log(nombre);
        ruta.add(`/${nombre}`);
      } else {
        ruta.add(`/${elemento.textContent.toLowerCase()}`);
      }
      console.log('ruta.join ', Array.from(ruta).join(''));
      location.hash = Array.from(ruta).join('');//agrega la ruta al hash
    });
  })
  /*///////////////////////////////ARCHIVOS////////////////////////////////////////////////*/
  let archivos = document.querySelectorAll('#file');
  archivos.forEach(elemento => {

    // elemento.addEventListener('click', (e) => {
    let link = `${Array.from(ruta).join('')}/${elemento.textContent}`
    dbx.filesDownload({ path: `${link}` })
      .then(function (response) {
        // console.log(response);
        let downloadUrl = URL.createObjectURL(response.fileBlob);
        elemento.setAttribute('href', downloadUrl);
        elemento.setAttribute('download', response.name);
      })
      .catch(function (error) {
        console.error(error);
      });
  })
  loadingElem.classList.add('hidden')
}
const reset = () => {
  state.files = []
  init();
}
const updateFiles = (files) => {
  state.files = [...state.files, ...files]
  renderFiles()
}
const renderFiles = () => {
  fileListElem.innerHTML = state.files.sort((a, b) => {
    // sort alphabetically, folders first
    if ((a['.tag'] === 'folder' || b['.tag'] === 'folder')
      && !(a['.tag'] === b['.tag'])) {
      return a['.tag'] === 'folder' ? -1 : 1
    } else {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
    }
  }).map(file => {
    const type = file['.tag']
    if (type === 'file') {

      return `<tr>
      <th><a id="file" class="dbx-list-item pointer ${type}" >${file.name}</a></td>
      <th id="tamaño" >${Math.round((file.size) / 1024)} KB</td>
      <th id="" >Archivo</td>
      </tr>`;
    } else {

      return `<tr>
      <th><a id="path"  class="dbx-list-item pointer ${type}">${file.name}</a></td>
      <th id="tamaño" >-</td>
      <th id="" >Directorio</td> 
    </tr>`;
    }
  }).join('');
}
window.addEventListener('hashchange', () => {
  loadingElem.classList.remove('hidden')
  console.log('cambio de hash');
  let hashid = location.hash.split('#')[1];
  //console.log('ruta: 1 ',Array.from(ruta).join(''));
  //console.log('hasID: ',hashid.split('/'));
  state.rootPath = hashid;
  ruta.clear()
  hashid.split('/').forEach(e => {
    if (e === '') { } else { ruta.add(`/${e}`); }
  })
  console.log(ruta);
  //console.log('ruta: 2 ',Array.from(ruta).join(''));
  reset();
})
location.hash = state.rootPath;
ruta.add(`${location.hash.split('#')[1]}`);


