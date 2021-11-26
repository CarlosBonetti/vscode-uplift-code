import { h, render } from "preact";
import { ComplexityTrendChart } from "../components/ComplexityTrendChart";
import { FileLink } from "../components/FileLink";
import { useVsCodeProps } from "../hooks/useVsCodeProps";
import { FileSummaryPageProps } from "./FileSummaryPage.types";

const FileSummaryPage = (props: FileSummaryPageProps) => {
  const { since, currentFileName, currentFileChurn, complexity, coupling, complexityItems } = props;

  return (
    <main>
      <h1>Uplift Code: File Summary</h1>
      <p>All data displayed is taking in consideration commits from the last {since}</p>

      <h2>File stats</h2>
      <p>
        <a
          href="https://marketplace.visualstudio.com/items?itemName=CarlosBonetti.vscode-uplift-code#churn"
          target="_blank"
        >
          What is that?
        </a>
      </p>

      <p>
        File: <code>{currentFileName}</code>
      </p>

      <table>
        <tbody>
          <tr>
            <th style={{ textAlign: "left" }}>File churn</th>
            <td style={{ textAlign: "right" }}>{currentFileChurn || "Loading..."}</td>
          </tr>
          <tr>
            <th style={{ textAlign: "left" }}>Cyclomatic Complexity</th>
            <td style={{ textAlign: "right" }}>{complexity || "Loading..."}</td>
          </tr>
        </tbody>
      </table>

      <h2>Complexity Trend</h2>
      {!complexityItems && <p>Loading...</p>}
      {!!complexityItems && <ComplexityTrendChart items={complexityItems} />}

      <h2>File coupling</h2>
      <p>
        <a
          href="https://marketplace.visualstudio.com/items?itemName=CarlosBonetti.vscode-uplift-code#file-coupling"
          target="_blank"
        >
          What is that?
        </a>
      </p>

      {!coupling && <p>Loading...</p>}

      {!!coupling && (
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>File</th>
              <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Coupling ratio</th>
            </tr>
          </thead>
          <tbody>
            {coupling?.map((item) => (
              <tr>
                <td>
                  <FileLink href={item.href}>{item.file}</FileLink>
                </td>
                <td style={{ textAlign: "right" }}>{item.ratio}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

const App = () => {
  const [props] = useVsCodeProps();

  return <FileSummaryPage {...props} />;
};

render(<App />, document.getElementById("root"));
