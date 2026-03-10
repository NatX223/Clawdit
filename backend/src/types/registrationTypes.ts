// Define the expected structure of the EIP-8004 Agent Card
export interface AgentEndpoint {
    name: string;
    endpoint: string;
    version?: string;
    capabilities?: string[];
}

export interface AgentProfile {
    type: string;
    name: string;
    description: string;
    image: string;
    endpoints: AgentEndpoint[];
    active: boolean;
    x402Support: boolean;
    supportedTrust: string[];
    tags: string[];
    oasf_skills: string[];
    oasf_domains: string[];
}