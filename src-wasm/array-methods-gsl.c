#include <gsl/gsl_statistics.h>

__attribute__((used)) double meanFloat64Array (double* data, int length)
{
  return gsl_stats_mean(data, 1, length);
}
