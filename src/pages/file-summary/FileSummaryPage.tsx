import React from "react";
import ReactDOM from "react-dom";
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
            <th align="left">File churn</th>
            <td align="right">{currentFileChurn || "Loading..."}</td>
          </tr>
          <tr>
            <th align="left">Cyclomatic Complexity</th>
            <td align="right">{complexity || "Loading..."}</td>
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
              <th align="left">File</th>
              <th align="right" style={{ whiteSpace: "nowrap" }}>
                Coupling ratio
              </th>
            </tr>
          </thead>
          <tbody>
            {coupling?.map((item) => (
              <tr>
                <td>
                  <FileLink href={item.href}>{item.file}</FileLink>
                </td>
                <td align="right">{item.ratio}%</td>
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

ReactDOM.render(<App />, document.getElementById("root"));
