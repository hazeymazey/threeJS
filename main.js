var uMouse = new THREE.Vector2(0,0);

const container = document.querySelector('.scene')

//scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera( 70, container.clientWidth / container.clientHeight, 0.1, 1000 );
camera.position.z = 5;

//renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize( container.clientWidth, container.clientHeight );
renderer.setPixelRatio(1);
container.appendChild( renderer.domElement );

//resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
})

//mouse move
container.addEventListener('mousemove', (e) => {
    // mousemove / touchmove
    uMouse.x = e.offsetX / container.clientWidth ;
    uMouse.y = 1. - ( e.offsetY / container.clientHeight );

});

var textureloader = new THREE.TextureLoader();
textureloader.crossOrigin = "Anonymous"//This is to load from URL. Unnecessary for local files
const texture = textureloader.load('graf.jpg');
const material = new THREE.MeshBasicMaterial( { map: texture });

const geometry = new THREE.BoxGeometry(8, 6);
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// post processing
const composer = new THREE.EffectComposer( renderer );
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

var myEffect = {
    uniforms: {
      "tDiffuse": { value: null },
      "resolution": { value: new THREE.Vector2(1.,container.clientWidth/container.clientHeight) },
      "uMouse": { value: new THREE.Vector2(-10,-10) },
      "uVelo": { value: 0 },
    },
    vertexShader: `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );}`,
    fragmentShader: `uniform float time;
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    varying vec2 vUv;
    uniform vec2 uMouse;
    float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
      uv -= disc_center;
      uv*=resolution;
      float dist = sqrt(dot(uv, uv));
      return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
    }
    void main()  {
        vec2 newUV = vUv;
        float c = circle(vUv, uMouse, 0.0, 0.2);
        float r = texture2D(tDiffuse, newUV.xy += c * (0.1 * .5)).x;
        float g = texture2D(tDiffuse, newUV.xy += c * (0.1 * .525)).y;
        float b = texture2D(tDiffuse, newUV.xy += c * (0.1 * .55)).z;
        vec4 color = vec4(r, g, b, 1.);

        gl_FragColor = color;
    }`
}

customPass = new THREE.ShaderPass(myEffect);
customPass.renderToScreen = true;
composer.addPass(customPass);

function animate() {
    customPass.uniforms.uMouse.value = uMouse;
    requestAnimationFrame( animate );

    renderer.render( scene, camera );
    composer.render()

}

animate();
