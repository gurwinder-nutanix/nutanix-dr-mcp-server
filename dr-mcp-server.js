#!/usr/bin/env node

// Import the MCP SDK - this lets us build MCP servers
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

// Set up the server keys.
const V4_API_KEY = process.env.V4_API_KEY;

// !!!! THIS SHOULD NEVER BE IN PRODUCTION !!!!
// TODO: Write a custom certificate verifier for production use.
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const PC_IP_ADDRESS = process.env.PC_IP_ADDRESS;

// Using the V4.1 APIs for the MCP server.
const DR_V4_API_BASE_URL = "https://" + PC_IP_ADDRESS + ":9440/api/dataprotection/v4.1/config";

// Helper function to make API calls
async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${V4_API_KEY}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your API key.");
      } else if (response.status === 404) {
        throw new Error("Resource not found. Please check the input and try again.");
      } else {
        throw new Error(`V4 API error: ${response.status} - ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to V4 API Gateway. Please check your internet connection.");
    }
    throw error;
  }
}

// Mock data for mapping VM names to their IDs.
const VMS_DATA = {
    "data": [
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "55a0ff0a-cc69-433d-9767-f465547afd51",
            "name": "auto_pc_68e338ef36023623f264d2430"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "767a0647-9409-478f-7aac-ee25192a8507",
            "name": "guri-vm-4"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "f0e154bc-d3af-497b-59d8-a54624add92f",
            "name": "guri-vm-1"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "93965c0e-ce4c-40e6-7f84-1292c22c7ec9",
            "name": "guri-vm-2"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "ce77c777-006e-4e2d-694c-c9f6f08ca3dc",
            "name": "guri-vm-3"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "460103d5-e4a7-4b1e-6b51-ff67a3fe55c7",
            "name": "guri-vm-5"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "ce22c391-085b-4a97-70db-6dd2b89b1704",
            "name": "guri-vm-6"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "02deeb19-35f2-4f7c-5501-88d960cae5cc",
            "name": "guri-vm-7"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "f8db6b81-c89a-4174-78ea-6190dd8bf38b",
            "name": "guri-vm-8"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "75c59100-1d30-40d4-550a-d7a247eb55af",
            "name": "guri-vm-9"
        },
        {
            "$reserved": {
                "$fv": "v4.r2"
            },
            "$objectType": "vmm.v4.ahv.config.Vm",
            "extId": "97e50a8d-8a15-4a99-4080-f746841b809b",
            "name": "guri-vm-10"
        }
    ],
    "$reserved": {
        "$fv": "v4.r2"
    },
    "$objectType": "vmm.v4.ahv.config.ListVmsApiResponse",
    "metadata": {
        "flags": [
            {
                "$reserved": {
                    "$fv": "v1.r0"
                },
                "$objectType": "common.v1.config.Flag",
                "name": "hasError",
                "value": false
            },
            {
                "$reserved": {
                    "$fv": "v1.r0"
                },
                "$objectType": "common.v1.config.Flag",
                "name": "isPaginated",
                "value": true
            },
            {
                "$reserved": {
                    "$fv": "v1.r0"
                },
                "$objectType": "common.v1.config.Flag",
                "name": "isTruncated",
                "value": false
            }
        ],
        "$reserved": {
            "$fv": "v1.r0"
        },
        "$objectType": "common.v1.response.ApiResponseMetadata",
        "links": [
            {
                "$reserved": {
                    "$fv": "v1.r0"
                },
                "$objectType": "common.v1.response.ApiLink",
                "href": "https://10.61.5.131:9440/api/vmm/v4.0/ahv/config/vms?$page=0&$limit=50&$select=name",
                "rel": "first"
            },
            {
                "href": "https://10.61.5.131:9440/api/vmm/v4.0/ahv/config/vms?$page=0&$limit=50&$select=name",
                "rel": "self"
            },
            {
                "href": "https://10.61.5.131:9440/api/vmm/v4.0/ahv/config/vms?$page=0&$limit=50&$select=name",
                "rel": "last"
            }
        ],
        "totalAvailableResults": 11,
        "extraInfo": [
            {
                "$reserved": {
                    "$fv": "v1.r0"
                },
                "$objectType": "common.v1.config.KVPair",
                "name": "truncatedIndexes"
            }
        ]
    }
}

// Step 1: Create our MCP server
const server = new Server(
  {
    name: "dr-mcp-server",  // Name of our server
    version: "1.0.0",             // Version number
  },
  {
    capabilities: {
      tools: {},  // We're providing tools (functions Claude can call)
    },
  }
);

// Step 2: Tell Claude what tools are available
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
    //   {
    //     name: "list_recovery_points_for_a_vm",
    //     description: "List all recovery points present in the system for a specific VM",
    //     inputSchema: {
    //       type: "object",
    //       properties: {
    //         vm_ext_id: {
    //           type: "string",
    //           description: "ID/UUID/ExtID of the virtual machine to list recovery points for"
    //         }
    //       },
    //       required: ["vm_ext_id"]
    //     }
    //   },
      {
        name: "list_recovery_points",
        description: "List all recovery points present in the system.",
        inputSchema: {
          type: "object",
          properties: {},  // No parameters needed
        }
      }
    ]
  };
});

// Step 3: Handle when Claude calls our tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_recovery_points") {
    // const recovery_points = Object.keys(RECOVERY_POINTS_DATA)
    //   .map(city => city.charAt(0).toUpperCase() + city.slice(1))
    //   .join(", ");
    const api_endpoint = `${DR_V4_API_BASE_URL}/recovery-points?$limit=100&page=0`;
    const RECOVERY_POINTS_DATA = await fetchData(api_endpoint);

    const recovery_points_data_section = RECOVERY_POINTS_DATA.data;
    const recovery_points_metadata_section = RECOVERY_POINTS_DATA.metadata;
    const recovery_point_names = RECOVERY_POINTS_DATA.data.map(rp => rp.name);

    return {
      content: [
        {
          type: "text",
          text: `Recovery Points present on the system: ${recovery_point_names.join(", ")}. These are the names of the recovery points.`
        },
        {
          type: "text",
          text: `Number of Recovery Points present on the system: ${RECOVERY_POINTS_DATA.metadata.totalAvailableResults}.`
        },
        {
          type: "text",
          text: "Full in depth information on all the recovery points on the system in json format: ```json\\n" + JSON.stringify(recovery_points_data_section, null, 2) + "\\n```"
        },
        {
          type: "text",
          text: "Metadata about the recovery points on the system in json format: ```json\\n" + JSON.stringify(recovery_points_metadata_section, null, 2) + "\\n```"
        },
        {
          type: "text",
          text: "Full in depth information on all the Virtual Machines (VMs) on the system in json format: ```json\\n" + JSON.stringify(VMS_DATA, null, 2) + "\\n```"
        },
        {
          type: "text",
          text: "Metadata about the recovery points on the system in json format: ```json\\n" + JSON.stringify(VMS_DATA, null, 2) + "\\n```"
        }
      ]
    };
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});

// Step 4: Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // This message goes to stderr so it doesn't interfere with MCP communication
  console.error("Data Protection and Backup MCP Server is running! 🌤️");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});