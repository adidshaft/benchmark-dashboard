# Covalboard: Enterprise RPC Intelligence Platform

![Covalboard Dashboard](https://via.placeholder.com/1200x600?text=Covalboard+Enterprise+Dashboard)

**Covalboard** is a high-performance competitive intelligence and benchmarking suite designed for Web3 infrastructure teams. It provides real-time, side-by-side analysis of RPC providers across latency, throughput, stability, security, and cost efficiency.

Unlike standard "ping" tools, Covalboard performs deep inspection of provider capabilities, including batch processing efficiency, historical block access, and header security hygiene.

## 🚀 Key Features

*   **Real-Time Benchmarking:** Measures P50 (Median) and P99 (Stress) latency directly from the client browser.
*   **Builder's Impact Framework:** A novel testing methodology that benchmarks the "Total Developer Experience" by simulating real-world scenarios (e.g., Portfolio Loading, DEX Swaps) rather than just single-call latency.
*   **AI-Powered Analysis:** Integrated **OpenAI GPT-4o** analyst that detects anomalies, explains performance discrepancies, and provides actionable recommendations based on the data.
*   **Algorithmic Scoring (CovalScore™):** Uses **Sigmoid Normalization** (`100 / (1 + e^-k(x-μ))`) to ensure valid comparisons across varying network conditions, penalizing outliers without destroying the scale.
*   **Latency Heatmap:** Visualizes the "Time-to-Interactive" across different method calls (`eth_call`, `eth_getLogs`, `trace_call`) to spot specific bottlenecks.
*   **Regional Latency Simulation:** Toggle between 'Last Mile' latency (Auto) or simulated regional penalties (US, EU, Asia) to test global performance.
*   **Batch Throughput Analysis:** Simulates high-load dashboard scenarios by sending batches of 10 requests to test provider capacity.
*   **Security Auditor:** Passive inspection of response headers to detect information leaks (e.g., exposed server versions) and SSL/TLS enforcement.
*   **Cost Calculator:** Dynamic monthly cost estimation based on adjustable request volume sliders.

## 📊 Networks & Providers

The platform currently supports benchmarking across major EVM networks and top-tier providers.

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
| **Covalent** | Unified API | GET | Data Richness, 1-Click Fetch |
| **Mobula** | Asset API | GET | Market Data Latency |
| **Codex** | Graph API | POST | Asset Data, Complex Queries |

## 🛠️ Technical Stack

*   **Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS (Glassmorphism UI)
*   **Visualization:** Recharts (Radar, Bar, Heatmap)
*   **Math Rendering:** KaTeX (for LaTeX Formulas)
*   **AI Integration:** OpenAI GPT-4o
*   **Icons:** Lucide React
*   **Benchmarking Engine:** Custom `useBenchmark` & `usePortfolioBenchmark` hooks with `AbortController` timeouts and concurrency management.

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adidshaft/benchmark-dashboard.git
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
    VITE_OPENAI_API_KEY=your_openai_key  # Required for AI Analysis
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🧪 Methodology

Covalboard aims for transparency in its metrics. Click the **"Docs"** button in the app for a full breakdown.

### The CovalScore™ Formula
We use Sigmoid Normalization to score providers. This method is superior to linear ranking because it handles outliers gracefully.

$$ Score = \sum \left( \frac{100}{1 + e^{-k(x - \mu)}} \times W_i \right) $$

*   **x**: Raw Metric (e.g., Latency)
*   **μ**: Industry Mean (Baseline)
*   **k**: Sensitivity Slope
*   **W_i**: Weight of the specific metric based on the selected Use Case (e.g., Trading vs. Indexing).

### Builder's Impact Framework
Unlike traditional "ping" tests, this framework evaluates the **efficiency** of building a feature.
*   **Unified API (e.g., Covalent):** Fetches Balances + Metadata + Prices in **1 Call**.
*   **Standard RPC (e.g., Infura):** Requires **N+1 Calls** (Waterfall) to fetch the same data.
*   **Metric:** Time-to-Interactive (Total user wait time).

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
