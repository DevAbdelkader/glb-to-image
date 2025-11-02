import './style.css'
import * as THREE from 'three'
import { waitForGLBUpload } from './uploader.js'
import ModelLoader from './ModelLoader.js'

async function start() {
	let objects = [];
	let captures = [];

	const appRoot = document.getElementById('model');
	const fileUpload = document.getElementById('file-upload');
	const capturePanel = document.getElementById('capture-panel');

	const Model = new ModelLoader(appRoot);
	Model.setupOrbitControls();
	// Add Lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	Model.scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.set(10, 10, 10);
	Model.scene.add(directionalLight);

	// Camera Position Inputs
	const posXInput = document.getElementById('pos-x');
	const posYInput = document.getElementById('pos-y');
	const posZInput = document.getElementById('pos-z');

	// Background Color
	const bgColorInput = document.getElementById('bg-color');
	bgColorInput.onchange = () => {
		Model.scene.background = new THREE.Color(bgColorInput.value);
	};

	const bgTCheckbox = document.getElementById('bg-transparent');
	bgTCheckbox.onchange = () => {
		if (bgTCheckbox.checked) {
			Model.scene.background = null;
			bgColorInput.disabled = true;
		} else {
			bgColorInput.disabled = false;
			Model.scene.background = new THREE.Color(bgColorInput.value);
		}
	}

	// MIME
	const imgExtSelect = document.getElementById('img-ext');

	// Capture Button
	const captureBtn = document.getElementById('capture-btn');
	captureBtn.onclick = () => {
		captureImage(Model.renderer.domElement, imgExtSelect.value);
	}

	// Back Button
	const backBtn = document.getElementById('back-btn');
	backBtn.onclick = () => {
		const historyDiv = document.getElementById('captures');
		historyDiv.innerHTML = '';
		captures = [];

		objects.forEach((obj) => Model.scene.remove(obj));
		objects = [];

		Model.scene.background = null;

		pickModel();
	}

	// Update camera position inputs on control change
	Model.controls.addEventListener('change', () => {
		posXInput.value = Model.camera.position.x.toFixed(4);
		posYInput.value = Model.camera.position.y.toFixed(4);
		posZInput.value = Model.camera.position.z.toFixed(4);
	});

	// Attach event listeners to position inputs
	[posXInput, posYInput, posZInput].forEach((input) => addEventListener('change', () => {
		const x = parseFloat(posXInput.value) || 0;
		const y = parseFloat(posYInput.value) || 0;
		const z = parseFloat(posZInput.value) || 0;
		Model.camera.position.set(x, y, z);
	}));



	// Pick and Load Model
	async function pickModel() {
		capturePanel.hidden = true;
		fileUpload.hidden = false;
		const file = await waitForGLBUpload();
		if (!file) {
			console.log('No file uploaded.');
			return;
		}

		reset();
		showModel(file);
	}

	async function showModel(file) {
		const url = URL.createObjectURL(file);

		panelLoading(true);
		const uploaded = await Model.loadModel(url);
		panelLoading(false);
		capturePanel.hidden = false;
		Model.scene.background = new THREE.Color(bgColorInput.value);

		objects.push(uploaded.scene);
	}

	function panelLoading(status) {
		capturePanel.hidden = true;
		fileUpload.hidden = true;
		document.getElementById('loading-panel').hidden = !status;
	}

	// Capture Image
	function captureImage(element, mime = 'image/jpeg') {
		const dataURL = element.toDataURL(mime);
		captures.push(dataURL);

		renderCaptureHistory();
	}

	function renderCaptureHistory() {
		const historyDiv = document.getElementById('captures');
		historyDiv.innerHTML = '';

		captures.forEach((dataURL, index) => {
			const mainDiv = document.createElement('div');
			mainDiv.dataset.id = index;
			mainDiv.className = 'relative group w-20 h-20 bg-gray-100 rounded overflow-hidden border border-gray-200 flex items-center justify-center';

			const controlsDiv = document.createElement('div');
			controlsDiv.className = 'absolute inset-0 bg-black/20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity';

			const image = document.createElement('img');
			image.className = 'w-full h-full object-cover';
			image.src = dataURL;

			const downloadBtn = document.createElement('button');
			downloadBtn.className = 'cursor-pointer bg-white stroke-black hover:bg-black hover:stroke-white text-gray-700 p-1 rounded text-xs';
			downloadBtn.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
				<path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5m-5-7v12" />
			</svg>`;
			downloadBtn.addEventListener('click', () => downloadImage(dataURL, `capture-${index + 1}`));

			const removeBtn = document.createElement('button');
			removeBtn.className = 'cursor-pointer bg-white hover:bg-black hover:fill-white text-gray-700 p-1 rounded text-xs';
			removeBtn.innerHTML = `
			<svg
				xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 40 40">
				<path
					d="M21.499 19.994L32.755 8.727a1.064 1.064 0 0 0-.001-1.502c-.398-.396-1.099-.398-1.501.002L20 18.494L8.743 7.224c-.4-.395-1.101-.393-1.499.002a1.05 1.05 0 0 0-.309.751c0 .284.11.55.309.747L18.5 19.993L7.245 31.263a1.064 1.064 0 0 0 .003 1.503c.193.191.466.301.748.301h.006c.283-.001.556-.112.745-.305L20 21.495l11.257 11.27c.199.198.465.308.747.308a1.058 1.058 0 0 0 1.061-1.061c0-.283-.11-.55-.31-.747L21.499 19.994z" />
			</svg>`;
			removeBtn.addEventListener('click', () => {
				captures = captures.filter((_, i) => i !== index);
				renderCaptureHistory();
			});

			mainDiv.appendChild(image);
			controlsDiv.appendChild(downloadBtn);
			controlsDiv.appendChild(removeBtn);
			mainDiv.appendChild(controlsDiv);
			historyDiv.appendChild(mainDiv);
		});
	}

	function downloadImage(dataURL, filename = 'capture') {
		const link = document.createElement("a");
		link.href = dataURL;
		link.download = filename;
		link.click();

		// cleanup
		link.remove();
	}

	function reset() {
		posXInput.value = "";
		posYInput.value = "";
		posZInput.value = "";
		bgColorInput.value = "#ffffff";
		bgTCheckbox.checked = false;
		imgExtSelect.value = "image/png";
	}

	// Entry Point
	pickModel();
}

start();