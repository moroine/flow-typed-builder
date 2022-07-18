// @flow

import type { BlockStatement, Statement } from '@babel/types';
import { blockStatement, declareExportDeclaration } from '@babel/types';

function toFlowModuleBlockStatement(
  statements: $ReadOnlyArray<Statement>,
): BlockStatement {
  return blockStatement(statements.map((statement) => {
    switch (statement.type) {
      case 'ExportNamedDeclaration': {
        if (statement.declaration?.type === 'InterfaceDeclaration') {
          if (statement.specifiers && statement.specifiers.length > 0) {
            console.log('toFlowModuleBlockStatement: ExportNamedDeclaration with specifiers not suported');
          }

          return declareExportDeclaration(
            statement.declaration,
          );
        }

        return statement;
      }
      default: {
        return statement;
      }
    }
  }));
}

export {
  toFlowModuleBlockStatement,
};
