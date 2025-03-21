const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('WebGL not supported!');
}

// Vertex shader program
const vertexShaderSource = `
    attribute vec4 a_position;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;
    void main(void) {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
    }
`;

// Fragment shader program
const fragmentShaderSource = `
    precision mediump float;
    void main(void) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);  // Green color
    }
`;

// Create and compile the vertex shader
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling shader!', gl.getShaderInfoLog(shader));
    }
    return shader;
}

const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

// Create the shader program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfoLog(shaderProgram));
}

// Use the program
gl.useProgram(shaderProgram);

// Cube vertex positions
const vertices = new Float32Array([
    -0.5, -0.5,  0.5,  // Front face
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    -0.5, -0.5, -0.5,  // Back face
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,
]);

// Create buffer and load vertices
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Get attribute and uniform locations
const aPosition = gl.getAttribLocation(shaderProgram, 'a_position');
const uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'u_modelViewMatrix');
const uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'u_projectionMatrix');

// Enable the attribute
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

// Set the viewport to match the canvas size
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set background color to black

// Perspective matrix
function perspective(fov, aspect, near, far) {
    const top = near * Math.tan(fov * Math.PI / 360);
    const right = top * aspect;
    const projectionMatrix = new Float32Array(16);
    projectionMatrix[0] = near / right;
    projectionMatrix[5] = near / top;
    projectionMatrix[10] = -(far + near) / (far - near);
    projectionMatrix[11] = -1;
    projectionMatrix[14] = -(2 * far * near) / (far - near);
    projectionMatrix[15] = 0;
    return projectionMatrix;
}

// ModelView matrix for rotating the cube
function rotationMatrix(angle, x, y, z) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Float32Array([
        cos + (1 - cos) * x * x, (1 - cos) * x * y - z * sin, (1 - cos) * x * z + y * sin, 0,
        (1 - cos) * y * x + z * sin, cos + (1 - cos) * y * y, (1 - cos) * y * z - x * sin, 0,
        (1 - cos) * z * x - y * sin, (1 - cos) * z * y + x * sin, cos + (1 - cos) * z * z, 0,
        0, 0, 0, 1
    ]);
}

// Animation loop
function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set perspective and modelview matrices
    const projection = perspective(45, canvas.width / canvas.height, 0.1, 100);
    const modelView = rotationMatrix(Date.now() * 0.001, 1, 1, 0);  // Rotate around the x and y axes

    gl.uniformMatrix4fv(uProjectionMatrix, false, projection);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelView);

    // Draw the cube
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // Front face
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4); // Back face

    requestAnimationFrame(animate);
}

animate();
