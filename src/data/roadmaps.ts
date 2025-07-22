import type { RoadmapData } from '../types';

export const qiskitRoadmap: RoadmapData = {
  "title": "Qiskit Quantum Programming Roadmap",
  "weeks": [
    {
      "week": "1",
      "focus": "Setup & Quantum Basics",
      "topics": ["Install Qiskit", "Qubit states", "Bloch sphere visualization"],
      "goals": ["Understand qubit concept", "Familiarize with Qiskit syntax"],
      "deliverables": ["Install Qiskit", "Single-qubit circuit on Bloch sphere", "Run basic circuits on Aer simulator"],
      "reference": [
        {"type": "Resource", "title": "Qiskit Installation Guide", "url": "https://qiskit.org/documentation/getting_started.html"},
        {"type": "Resource", "title": "Qiskit Textbook: The Atoms of Computation", "url": "https://qiskit.org/textbook/ch-states/atoms-computation.html"}
      ]
    },
    {
      "week": "2",
      "focus": "Quantum Gates & Circuits",
      "topics": ["Single-qubit gates (X, Y, Z, H, S, T)", "Multi-qubit gates (CNOT, CZ, SWAP, Toffoli)"],
      "goals": ["Learn gate transformations", "Build multi-qubit circuits"],
      "deliverables": ["Custom 3+ qubit circuit", "Visualize unitary transformation", "Understand gate equivalence"],
      "reference": [
        {"type": "Resource", "title": "Qiskit Textbook: Basic Quantum Gates", "url": "https://qiskit.org/textbook/ch-gates/introduction.html"}
      ]
    },
    {
      "week": "3",
      "focus": "Measurement & Simulation",
      "topics": ["Measurement (Z-basis, other bases)", "Aer simulator", "Noise models"],
      "goals": ["Understand measurement collapse", "Simulate probabilistic outcomes"],
      "deliverables": ["Simulate circuit with measurement", "Compare multiple simulators", "Show noise effects"],
      "reference": [
        {"type": "Resource", "title": "Qiskit Textbook: Measurement", "url": "https://qiskit.org/textbook/ch-quantum-circuits/measurements.html"}
      ]
    }
  ],
  "prerequisites": [
    "Python (basic to intermediate)",
    "Linear Algebra (vectors, matrices, complex numbers)",
    "Quantum Mechanics (superposition, measurement, gates – basic level)"
  ],
  "checklist": [
    "Setup & Install Qiskit",
    "Learn gates & measurement",
    "Run simulations",
    "Implement quantum algorithms"
  ]
};

export const qutipRoadmap: RoadmapData = {
  "title": "QuTiP Learning Roadmap (16 Weeks)",
  "description": "Learn QuTiP from quantum mechanics basics to advanced simulations",
  "weeks": [
    {
      "week": "1",
      "focus": "Foundations – Python, Quantum Mechanics, QuTiP Basics",
      "topics": [
        "Python essentials (numpy, matplotlib, Jupyter)",
        "Quantum states, operators, matrix mechanics",
        "Installing & using QuTiP"
      ],
      "goals": [
        "Set up the Python environment and install QuTiP",
        "Understand basic quantum mechanics concepts",
        "Learn to create quantum objects in QuTiP"
      ],
      "deliverables": [
        "Successfully install QuTiP",
        "Write code to define qubit basis states",
        "Simulate single qubit precession",
        "Use Bloch sphere class for visualization"
      ],
      "references": [
        {"type": "QuTiP Documentation", "section": "QuTip: Quantum Toolbox in Python", "url": "https://qutip.readthedocs.io/"}
      ]
    },
    {
      "week": "2",
      "focus": "Single Qubit Dynamics & Open Systems",
      "topics": [
        "Schrödinger vs. Lindblad master equations",
        "Collapse operators and decoherence",
        "Visualizing T1, T2 processes"
      ],
      "goals": [
        "Understand closed vs. open system evolution",
        "Learn to use QuTiP's mesolve",
        "Simulate qubit relaxation and dephasing"
      ],
      "deliverables": [
        "Reproduce T1 decay simulation",
        "Add T2 dephasing channel",
        "Simulate Rabi oscillations",
        "Visualize on Bloch sphere"
      ],
      "references": [
        {"type": "QuTiP User Guide", "section": "Lindblad Master Equation Solver", "url": "https://qutip.readthedocs.io/en/stable/guide/dynamics/dynamics-master.html"}
      ]
    }
  ],
  "prerequisites": [
    "Python programming (numpy, matplotlib)",
    "Linear Algebra",
    "Basic Quantum Mechanics"
  ],
  "checklist": [
    "Install and configure QuTiP",
    "Master quantum object creation",
    "Simulate single and multi-qubit dynamics",
    "Complete capstone project"
  ]
};

export const superconductivityRoadmap: RoadmapData = {
  "title": "Superconductivity Study Roadmap",
  "weeks": [
    {
      "week": "1",
      "focus": "Introduction to Superconductivity & Basic Phenomena",
      "topics": [
        "Definition of Superconductivity (zero resistance, magnetic field expulsion)",
        "Historical Context: Heike Kamerlingh Onnes (1911)",
        "Meissner Effect",
        "The London Equations"
      ],
      "goals": [
        "Understand fundamental characteristics of superconductivity",
        "Grasp historical development and key discoveries",
        "Familiarize with London equations"
      ],
      "deliverables": [
        "Summarize the Meissner effect",
        "Explain the London equations",
        "Describe flux quantization",
        "Differentiate local and nonlocal electrodynamics"
      ],
      "references": [
        {"type": "Book", "book": "Tinkham: Introduction to Superconductivity", "chapters": ["1 Historical Overview"]}
      ]
    },
    {
      "week": "2",
      "focus": "BCS Theory: Microscopic Understanding",
      "topics": [
        "Introduction to BCS Theory",
        "Cooper Pairs",
        "Isotope Effect",
        "Energy Gap"
      ],
      "goals": [
        "Understand microscopic origin of superconductivity",
        "Learn about Cooper pair formation",
        "Comprehend BCS energy gap"
      ],
      "deliverables": [
        "Explain Cooper pair formation",
        "Discuss isotope effect as evidence",
        "Describe BCS energy gap",
        "Analyze density of states"
      ],
      "references": [
        {"type": "Book", "book": "Tinkham: Introduction to Superconductivity", "chapters": ["3 The BCS Theory"]}
      ]
    }
  ],
  "prerequisites": [
    "Solid State Physics (basic to intermediate)",
    "Quantum Mechanics (basic principles)",
    "Electromagnetism (Maxwell's equations)",
    "Linear Algebra"
  ],
  "checklist": [
    "Understand fundamental phenomena",
    "Grasp BCS and Ginzburg-Landau theories",
    "Comprehend Josephson effect",
    "Study superconducting devices"
  ]
};

export const roadmaps = {
  qiskit: qiskitRoadmap,
  qutip: qutipRoadmap,
  superconductivity: superconductivityRoadmap
};