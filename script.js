let camera, scene, renderer;
let textMeshes = [];
const maxDistance = 2200; // Maximum distance for words along the z-axis
const initialNumWords = 50; // Initial number of words to display
const additionalNumWords = 1; // Number of additional words to add at a time
const numWordsToShow = 100; // Total number of words you want to display at a time
const spreadMultiplier = 1.5; // Multiplier to increase the spread range
let wordsArray = []; // Array to hold the words from the JSON
const safeZone = { x: 200, y: 200 }; // Safe zone dimensions around the logo

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 0;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff); // White background
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load words from JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            wordsArray = data.words; // Store words in the array
            console.log('Loaded words:', wordsArray); // Debug: Check if words are loaded
            addWordsToScene(initialNumWords); // Initial addition of words to the scene
        })
        .catch(error => console.error('Error loading JSON:', error));

    window.addEventListener('resize', onWindowResize, false);
}

function addWordsToScene(numWords) {
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        for (let i = 0; i < numWords; i++) {
            addNewWord(font);
        }
    }, function (error) {
        console.error('Error loading font:', error);
    });
}

function addNewWord(font) {
    const word = getRandomWord();
    const geometry = new THREE.TextGeometry(word, {
        font: font,
        size: 20, // Font size - adjust size here
        height: 3 // Depth of the text
    });
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, transparent: true, opacity: 0 });
    const textMesh = new THREE.Mesh(geometry, material);

    // Position new words at a random position but with a certain distance in z
    let xPosition, yPosition;
    do {
        xPosition = (Math.random() * 1200 - 600) * spreadMultiplier;
        yPosition = (Math.random() * 800 - 400) * spreadMultiplier;
    } while (Math.abs(xPosition) < safeZone.x && Math.abs(yPosition) < safeZone.y);

    let zPosition = Math.random() * -maxDistance;
    textMesh.position.set(xPosition, yPosition, zPosition);

    scene.add(textMesh);
    textMeshes.push(textMesh);

    // Gradually fade in the text
    new TWEEN.Tween(textMesh.material)
        .to({ opacity: 1 }, 2000) // Adjust the fade-in duration
        .start();
}

function getRandomWord() {
    return wordsArray[Math.floor(Math.random() * wordsArray.length)];
}

function animate() {
    requestAnimationFrame(animate);

    // Move the camera forward continuously
    camera.position.z -= 1.5; // Speed of the camera moving forward

    // Recycle words that are behind the camera
    textMeshes.forEach(mesh => {
        if (mesh.position.z > camera.position.z) {
            let xPosition, yPosition;
            do {
                xPosition = (Math.random() * 1200 - 600) * spreadMultiplier;
                yPosition = (Math.random() * 800 - 400) * spreadMultiplier;
            } while (Math.abs(xPosition) < safeZone.x && Math.abs(yPosition) < safeZone.y);

            mesh.position.set(xPosition, yPosition, camera.position.z - maxDistance); // Reset position far ahead
        }
    });

    // Gradually add new words over time
    if (textMeshes.length < numWordsToShow) {
        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            addNewWord(font);
        });
    }

    TWEEN.update(); // Update TWEEN animations
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
