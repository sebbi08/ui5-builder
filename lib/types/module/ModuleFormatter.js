const log = require("@ui5/logger").getLogger("types:application:ModuleFormatter");
const path = require("path");
const AbstractFormatter = require("../AbstractFormatter");

class ModuleFormatter extends AbstractFormatter {
	format(project) {
		return this.validate(project).then(() => {
			log.verbose("Formatting project %s...", project.metadata.name);
			project.resources.pathMappings = project.resources.configuration.paths;
		});
	}

	validate(project) {
		return Promise.resolve().then(() => {
			if (!project) {
				throw new Error("Project is undefined");
			} else if (!project.metadata || !project.metadata.name) {
				throw new Error(`"metadata.name" configuration is missing for project ${project.id}`);
			} else if (!project.type) {
				throw new Error(`"type" configuration is missing for project ${project.id}`);
			} else if (project.version === undefined) {
				throw new Error(`"version" is missing for project ${project.id}`);
			}

			if (!project.resources) {
				project.resources = {};
			}
			if (!project.resources.configuration) {
				project.resources.configuration = {};
			}
			if (!project.resources.configuration.paths) {
				project.resources.configuration.paths = {
					"/": ""
				};
			}
			const paths = project.resources.configuration.paths;
			const dirChecks =[];
			for (const virPath in paths) {
				if (paths.hasOwnProperty(virPath)) {
					const absolutePath = path.join(project.path, paths[virPath]);
					dirChecks.push(this.dirExists(absolutePath).then((bExists) => {
						if (!bExists) {
							throw new Error(`Could not find root directory of project ${project.id}: ` +
								`${absolutePath}`);
						}
					}));
				}
			}
			return Promise.all(dirChecks);
		});
	}
}

module.exports = ModuleFormatter;
