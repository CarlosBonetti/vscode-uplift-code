import { isFunctionWithBody } from "tsutils";
import {
  BinaryExpression,
  CaseClause,
  createSourceFile,
  forEachChild,
  FunctionLikeDeclaration,
  isIdentifier,
  Node,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
} from "typescript";

export function calculateComplexity(fileName: string, sourceText: string): number {
  const source = createSourceFile(fileName, sourceText, ScriptTarget.ESNext);
  const complexity = calculateSourceFileComplexity(source);
  return Math.max(1, ...Object.values(complexity));
}

function calculateSourceFileComplexity(sourceFile: SourceFile): Record<string, number> {
  let complexity = 0;
  const output: Record<string, number> = {};
  forEachChild(sourceFile, function cb(node) {
    if (isFunctionWithBody(node)) {
      const old = complexity;
      complexity = 1;
      forEachChild(node, cb);
      const name = getNodeFunctionName(node);
      output[name] = complexity;
      complexity = old;
    } else {
      if (increasesComplexity(node)) {
        complexity += 1;
      }
      forEachChild(node, cb);
    }
  });
  return output;
}

const increasesComplexity = (node: Node) => {
  switch (node.kind) {
    case SyntaxKind.CaseClause:
      return (node as CaseClause).statements.length > 0;
    case SyntaxKind.CatchClause:
    case SyntaxKind.ConditionalExpression:
    case SyntaxKind.DoStatement:
    case SyntaxKind.ForStatement:
    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement:
    case SyntaxKind.IfStatement:
    case SyntaxKind.WhileStatement:
      return true;

    case SyntaxKind.BinaryExpression:
      switch ((node as BinaryExpression).operatorToken.kind) {
        case SyntaxKind.BarBarToken:
        case SyntaxKind.AmpersandAmpersandToken:
          return true;
        default:
          return false;
      }

    default:
      return false;
  }
};

function getNodeFunctionName(node: FunctionLikeDeclaration): string {
  const { name, pos, end } = node;
  const key = name !== undefined && isIdentifier(name) ? name.text : JSON.stringify({ pos, end });
  return key;
}
