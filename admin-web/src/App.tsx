import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import type { FunctionComponent } from "./common/types";
import { TanStackRouterDevelopmentTools } from "./components/utils/development-tools/TanStackRouterDevelopmentTools";
import type { router as Router } from "./main";
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css'; // For Semi Bold, Bold
const queryClient = new QueryClient();

type AppProps = { router: typeof Router };

const App = ({ router }: AppProps): FunctionComponent => {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <TanStackRouterDevelopmentTools
                initialIsOpen={false}
                position="bottom-left"
                router={router}
            />
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        </QueryClientProvider>
    );
};

export default App;