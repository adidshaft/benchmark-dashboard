# Covalboard: Enterprise RPC Intelligence Platform

![Covalboard Dashboard](https://via.placeholder.com/1200x600?text=Covalboard+Enterprise+Dashboard)

**Covalboard** is a high-performance competitive intelligence and benchmarking suite designed for Web3 infrastructure teams. It provides real-time, side-by-side analysis of RPC providers across latency, throughput, stability, security, and cost efficiency.

Unlike standard "ping" tools, Covalboard performs deep inspection of provider capabilities, including batch processing efficiency, historical block access, and header security hygiene.

## 🚀 Key Features

* **Real-Time Benchmarking:** Measures P50 (Median) and P99 (Stress) latency directly from the client browser.
* **Batch Throughput Analysis:** Simulates high-load dashboard scenarios by sending batches of 10 requests to test provider capacity.
* **Optimization Strategy Engine:** Toggle scoring algorithms between "Balanced", "Performance First", "Cost Efficiency", and "Maximum Reliability".
* **Data Consistency Checks:** Real-time analysis of `eth_gasPrice` and Block Height to detect stale nodes or propagation lag.
* **Security Auditor:** Passive inspection of response headers to detect information leaks (e.g., exposed server versions) and SSL/TLS enforcement.
* **Deep-Dive Inspector:** Click on any provider to view raw JSON-RPC responses and specific security warnings.
* **Cost Calculator:** Dynamic monthly cost estimation based on adjustable request volume sliders.

## 📊 Networks & Providers

The platform currently supports benchmarking across 7 major networks and 6 top-tier providers.

### Supported Networks
| Network | Chain ID | Status |
| :--- | :--- | :--- |
| **Ethereum** | 1 | ✅ Active |
| **Polygon** | 137 | ✅ Active |
| **Arbitrum** | 42161 | ✅ Active |
| **Optimism** | 10 | ✅ Active |
| **Base** | 8453 | ✅ Active |
| **BSC (BNB)** | 56 | ✅ Active |
| **Avalanche** | 43114 | ✅ Active |

### Integrated Providers
| Provider | Type | Method | Features Tested |
| :--- | :--- | :--- | :--- |
| **Alchemy** | RPC | POST | Latency, Batching, Archive |
| **Infura** | RPC | POST | Latency, Batching |
| **QuickNode** | RPC | POST | Latency, Batching, Archive |
| **Covalent** | REST | GET | Data Availability, Throughput |
| **Mobula** | REST | GET | Market Data Latency |
| **Codex** | REST | GET | Asset Data Latency |

## 🛠️ Technical Stack

* **Framework:** React 18 (Vite)
* **Styling:** Tailwind CSS (Glassmorphism UI)
* **Visualization:** Recharts (Custom Radar & Bar Charts)
* **Icons:** Lucide React
* **Benchmarking Engine:** Custom `useBenchmark` hook with async concurrency control.

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/adidshaft/benchmark-dashboard.git](https://github.com/adidshaft/benchmark-dashboard.git)
    cd benchmark-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your API keys.
    *Note: Covalboard uses `VITE_` prefix for client-side exposure.*

    ```env
    VITE_ALCHEMY_KEY=your_alchemy_key
    VITE_INFURA_KEY=your_infura_key
    VITE_QUICKNODE_KEY=your_quicknode_key
    VITE_COVALENT_KEY=your_covalent_key
    VITE_MOBULA_KEY=your_mobula_key
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🧪 Methodology

Covalboard aims for transparency in its metrics. Click the **"Docs"** button in the app for a full breakdown.

* **P50 Latency:** The median response time of successful requests.
* **P99 Latency:** The "worst-case" response time (tail latency), crucial for understanding stability under load.
* **CovalScore™:** A weighted composite score derived from:
    * Speed (40%)
    * Uptime/Reliability (30%)
    * Cost Efficiency (15%)
    * Feature Completeness (15%)

## 🤝 Contributing

We welcome contributions to add new providers, support more chains, or refine the benchmarking logic.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/NewProvider`).
3.  Commit your Changes (`git commit -m 'Add: Support for Blast Network'`).
4.  Push to the Branch (`git push origin feature/NewProvider`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ⚠️ Disclaimer

**Client-Side Benchmarking:** This tool measures latency from *your* browser. Results may vary based on your geographic location and internet connection. For enterprise SLAs, always refer to the provider's official server-side guarantees.

---
