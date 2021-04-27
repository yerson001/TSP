Array.prototype.shuffle = function() {
  for (var j, x, i = this.length; i; j = Math.floor(Math.random()*i),
  	   x = this[--i],
  	   this[i] = this[j],
  	   this[j] = x);
  return this;
};

var City = function(startX, startY) {
	this.x = startX;
	this.y = startY;

	this.getX = function() {
		return this.x;
	}

	this.getY = function() {
		return this.y;
	}

	this.distanceFrom = function(city) {
		/* Use Pythagorean Theorem to calculate distance between cities */
		var deltaX = Math.pow(city.getX() - this.getX(), 2);
		var deltaY = Math.pow(city.getY() - this.getY(), 2);

		return Math.sqrt(Math.abs(deltaX + deltaY));
	}
}

var GeneticAlgorithm = function(populationSize, mutationRate, crossoverRate, elitismCount, tournametSize) {
	var populationSize = populationSize,
		mutationRate = mutationRate,
		crossoverRate = crossoverRate,
		elitismCount = elitismCount,
		tournametSize = tournametSize;

	this.initPopulation = function(chromosomeLength) {
		return new Population(populationSize, chromosomeLength);
	}

	this.calcFitness = function(individual, cities) {
		var route = new Route(individual, cities);
		var fitness = 1 / route.getDistance();

		individual.setFitness(fitness);

		return fitness;
	}

	this.evalPopulation = function(population, cities) {
		var populationFitness = 0;
		var individuals = population.getIndividuals();

		for (var i = 0; i < individuals.length; i++) {
			populationFitness += this.calcFitness(individuals[i], cities);
		}
		// Calculate average population fitness
		population.setPopulationFitness(populationFitness / population.size());
	}

	/* Tournament selection */
	this.selectParent = function(population) {
		var tournament = new Population(tournametSize);

		// Add random individuals to the tournament
		population.shuffle();
		for (var i = 0; i < tournametSize; i++) {
			var tournamentIndividual = population.getIndividual(i);
			tournament.setIndividual(i, tournamentIndividual);
		}

		// Return the best
		return tournament.getFittest();
	}

	this.crossoverPopulation = function(population) {
		var newPopulation = new Population(population.size(), 1);

		for (var popIndex = 0; popIndex < population.size(); popIndex++) {
			var parent1 = population.getFittest(popIndex);

			if (crossoverRate > Math.random() && popIndex >= elitismCount) {
				var parent2 = this.selectParent(population);

				// Create blank offspring chromosome
				var offspringChrom = new Array(parent1.getChromosomeLength()).fill(-1),
					offspring = new Individual(offspringChrom),
					substrPos1 = Math.random() * parent1.getChromosomeLength()|0,
					substrPos2 = Math.random() * parent2.getChromosomeLength()|0,
					startSubstr = (substrPos1 < substrPos2) ? substrPos1 : substrPos2,
					endSubstr = (substrPos1 > substrPos2) ? substrPos1 : substrPos2;

				// Loop and add the sub tour from parent1 to our child
				for (var i = startSubstr; i < endSubstr; i++) {
					offspring.setGene(i, parent1.getGene(i));
				}

				// Loop through parent2 city tour
				var parent2ChromLength = parent2.getChromosomeLength();
				for (var i = 0; i < parent2ChromLength; i++) {
					var parent2Gene = i + endSubstr;
					if (parent2Gene >= parent2ChromLength) {
						parent2Gene -= parent2ChromLength;
					}

					// If offspring doesn't have a city add it
					if (!offspring.containsGene(parent2.getGene(parent2Gene))) {
						// Loop to find a spare position in the child's tour
						for (var j = 0; j < offspring.getChromosomeLength(); j++) {
							// Spare position found, add city
							if (offspring.getGene(j) === -1) {
								offspring.setGene(j, parent2.getGene(parent2Gene));
								break;
							}
						}
					}
				}
				// Add child
				newPopulation.setIndividual(popIndex, offspring);
			} else {
				// Add individual to new population without applying crossover
				newPopulation.setIndividual(popIndex, parent1);
			}
		}

		return newPopulation;
	}

	this.mutatePopulation = function(population) {
		var newPopulation = new Population(populationSize);

		for (var i = 0; i < population.size(); i++) {
			var individual = population.getFittest(i);

			// Skip mutation if this is an elite individual
			if (i >= elitismCount) {
				for (var j = 0; j < individual.getChromosomeLength(); j++) {
					if (mutationRate > Math.random()) {
						var newGenePos = Math.random() * individual.getChromosomeLength()|0;
						var gene1 = individual.getGene(newGenePos);
						var gene2 = individual.getGene(j);
						individual.setGene(j, gene1);
						individual.setGene(newGenePos, gene2);
					}
				}
			}

			newPopulation.setIndividual(i, individual);
		}

		return newPopulation;
	}
}

var Route = function(individual, cities) {
	var route = [];
	var distance = 0;
	var chromosome = individual.getChromosome();

	for (var i = 0; i < chromosome.length; i++) {
		route[i] = cities[chromosome[i]];
	}

	this.getDistance = function() {
		if (distance > 0) {
			return distance;
		}

		// Loop over cities in route and calculate route distance
		var totalDistance = 0;
		for (var i = 0; i + 1 < route.length; i++) {
			totalDistance += route[i].distanceFrom(route[i + 1]);
		}

		totalDistance += route[route.length - 1].distanceFrom(route[0]);

		distance = totalDistance;

		return totalDistance;
	}

	this.chromosome = chromosome;
}

var Individual = function(initChromosome) {
	// Create random individual
	var fitness = -1,
		chromosome,
		individual = [];

	if (initChromosome instanceof Array)
		chromosome = initChromosome;
	else {
		for (var gene = 0; gene < initChromosome; gene++) {
			individual[gene] = gene;
		}
		chromosome = individual;
	}

	this.getChromosome = function() {
		return chromosome;
	}

	this.getChromosomeLength = function() {
		return chromosome.length;
	}

	this.setGene = function(offset, gene) {
		chromosome[offset] = gene;
	}

	this.getGene = function(offset) {
		return chromosome[offset];
	}

	this.setFitness = function(fit) {
		fitness = fit;
	}

	this.getFitness = function() {
		return fitness;
	}

	this.toString = function() {
		var output = "";
		for (var gene = 0; gene < chromosome.length; gene++)
			output += chromosome[gene];
		return output;
	}

	this.containsGene = function(gene) {
		for (var i = 0; i < chromosome.length; i++) {
			if (chromosome[i] === gene) {
				return true;
			}
		}
		return false;
	}
}

var Population = function(populationSize, chromosomeLength) {
	var population = [],
		populationFitness = -1;

	this.getFittest = function(offset) {
		return population.sort(function(a, b) {
			var aFit = a.getFitness(),
				bFit = b.getFitness();
			if (aFit > bFit) {
				return -1;
			} else if (aFit < bFit) {
				return 1;
			}
			return 0;
		})[offset || 0];
	}

	this.setPopulationFitness = function(fitness) {
		populationFitness = fitness;
	}

	this.getPopulationFitness = function() {
		return populationFitness;
	}

	this.size = function() {
		return population.length;
	}

	this.setIndividual = function(offset, individual) {
		return population[offset] = individual;
	}

	this.getIndividual = function(offset) {
		return population[offset];
	}

	this.getIndividuals = function() {
		return population;
	}

	this.shuffle = function() {
		population.shuffle();
	}

	if (chromosomeLength) {
		for (var i = 0; i < populationSize; i++) {
			population[i] = new Individual(chromosomeLength);
		}
	}
}

var TSP = TSP || {};

TSP.initialize = function(citiesArray, output) {
	this.cities = citiesArray,
	this.output = output;

	// Init GA
	this.ga = new GeneticAlgorithm(100, 0.001, 0.9, 2, 5);
	this.population = this.ga.initPopulation(this.cities.length);
	this.ga.evalPopulation(this.population, this.cities);
	this.generation = 1;
}

TSP.nextGeneration = function() {
	// Apply crossover
	this.population = this.ga.crossoverPopulation(this.population);

	// Apply mutation
	this.population = this.ga.mutatePopulation(this.population);

	// Evaluate population
	this.ga.evalPopulation(this.population, this.cities);

	// Output results
	var tempRoute = new Route(this.population.getFittest(), this.cities);
	this.output(this.generation, tempRoute.chromosome, tempRoute.getDistance());

	this.generation++;
}