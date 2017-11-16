import * as ko from "knockout";

export function Component(params: {name: string, template: string}) {
    return function(viewModel: any) {
      ko.components.register(params.name, {
        viewModel: viewModel,
        template: params.template
      });
      return viewModel;
    }
  }