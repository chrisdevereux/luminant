export interface AssetsByChunkName {
	main: string;
	named-chunk: string;
}

export interface Asset {
	name: string;
	size: number;
	chunks: number[];
	chunkNames: any[];
	emitted: boolean;
}

export interface Profile {
	factory: number;
	building: number;
	dependencies: number;
}

export interface Module {
	id: number;
	identifier: string;
	name: string;
	size: number;
	cacheable: boolean;
	built: boolean;
	optional: boolean;
	prefetched: boolean;
	chunks: number[];
	assets: any[];
	profile: Profile;
	failed: boolean;
	errors: number;
	warnings: number;
	reasons: any[];
	source: string;
}

export interface Origin {
	moduleId: number;
	module: string;
	moduleIdentifier: string;
	moduleName: string;
	loc: string;
	name: string;
	reasons: any[];
}

export interface Chunk {
	id: number;
	rendered: boolean;
	initial: boolean;
	entry: boolean;
	size: number;
	names: string[];
	files: string[];
	parents: any[];
	modules: Module[];
	filteredModules: number;
	origins: Origin[];
}

export interface Profile {
	factory: number;
	building: number;
	dependencies: number;
}

export interface Module {
	id: number;
	identifier: string;
	name: string;
	size: number;
	cacheable: boolean;
	built: boolean;
	optional: boolean;
	prefetched: boolean;
	chunks: number[];
	assets: any[];
	profile: Profile;
	failed: boolean;
	errors: number;
	warnings: number;
	reasons: any[];
	source: string;
}

export interface Stats {
	errors: string[];
	warnings: string[];
	version: string;
	hash: string;
	time: number;
	assetsByChunkName: AssetsByChunkName;
	assets: Asset[];
	chunks: Chunk[];
	modules: Module[];
	filteredModules: number;
	children: any[];
}
