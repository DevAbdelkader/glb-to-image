export function waitForGLBUpload() {

  return new Promise((resolve) => {
    let dropZone = document.getElementById('drop-zone');

    if (!dropZone) {
      console.error("No element with id 'drop-zone' found in the document.");
    }

    // Hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf,model/gltf-binary,application/octet-stream';
    input.style.display = 'none';
    input.setAttribute('aria-hidden', 'true');
    document.body.appendChild(input);

    function cleanup() {
      input.removeEventListener('change', onInputChange);
      dropZone.removeEventListener('click', onClick);
      dropZone.removeEventListener('dragover', onDragOver);
      dropZone.removeEventListener('dragleave', onDragLeave);
      dropZone.removeEventListener('drop', onDrop);
      dropZone.removeEventListener('keydown', onKeyDown);
      if (input.parentNode) document.body.removeChild(input);
    }

    function onInputChange(e) {
      const file = e.target.files && e.target.files[0];
      if (file) {
        highlight(false);
        cleanup();
        resolve(file);
      }
    }

    function onClick() {
      input.value = null;
      input.click();
    }

    function onDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      highlight(true);
    }

    function onDragLeave(e) {
      e.preventDefault();
      highlight(false);
    }

    function onDrop(e) {
      e.preventDefault();
      highlight(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        cleanup();
        resolve(file);
      }
    }

    function onKeyDown(e) {
      // Enter or Space triggers file picker
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }

    function highlight(state) {
      if (!dropZone) return;
      dropZone.style.borderColor = state ? '#4b9bee' : '#9aa6b2';
      dropZone.style.boxShadow = state ? '0 4px 20px rgba(75,155,238,0.12)' : 'none';
    }

    // Attach
    input.addEventListener('change', onInputChange);
    dropZone.addEventListener('click', onClick);
    dropZone.addEventListener('dragover', onDragOver);
    dropZone.addEventListener('dragleave', onDragLeave);
    dropZone.addEventListener('drop', onDrop);
    dropZone.addEventListener('keydown', onKeyDown);

    // Focus styling and accessibility
    dropZone.setAttribute('role', 'button');
    dropZone.setAttribute('aria-label', 'Upload GLB or GLTF file');
  });
}
