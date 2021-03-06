import { h, render } from "preact";
import { FileLink } from "../components/FileLink";
import { useVsCodeProps } from "../hooks/useVsCodeProps";
import { ProjectSummaryPageProps } from "./ProjectSummaryPage.types";

const ProjectSummaryPage = (props: ProjectSummaryPageProps) => {
  const { since, items } = props;

  return (
    <main>
      <h1>Uplift Code: Project Summary</h1>
      <p>All data displayed is taking in consideration commits from the last {since}</p>

      <h2>Highest file churn</h2>
      <p>
        <a
          href="https://marketplace.visualstudio.com/items?itemName=CarlosBonetti.vscode-uplift-code#churn"
          target="_blank"
        >
          What is that?
        </a>
      </p>

      {!items && <p>Loading...</p>}

      {!!items && (
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>File</th>
              <th style={{ textAlign: "right" }}>Churn</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr>
                <td>
                  <FileLink href={item.href}>{item.file}</FileLink>
                </td>
                <td style={{ textAlign: "right" }}>{item.churn}</td>
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

  return <ProjectSummaryPage {...props} />;
};

render(<App />, document.getElementById("root"));
