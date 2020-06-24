#include <stdlib.h>

__attribute__((used)) int* addInt32Arrays (int *array1, int* array2, int length)
{
  int* result = (int*) malloc(length * sizeof(int));
  if (result == 0)
    return 0;

  for (int i = 0; i < length; ++i) {
    result[i] = array1[i] + array2[i];
  }

  return result;
}

__attribute__((used)) int* subtractInt32Arrays (int *array1, int* array2, int length)
{
  int* result = (int*) malloc(length * sizeof(int));
  if (result == 0)
    return 0;

  for (int i = 0; i < length; ++i) {
    result[i] = array1[i] - array2[i];
  }

  return result;
}

__attribute__((used)) int* multiplyInt32Arrays (int *array1, int* array2, int length)
{
  int* result = (int*) malloc(length * sizeof(int));
  if (result == 0)
    return 0;

  for (int i = 0; i < length; ++i) {
    result[i] = array1[i] * array2[i];
  }

  return result;
}

__attribute__((used)) int* divideInt32Arrays (int *array1, int* array2, int length)
{
  int* result = (int*) malloc(length * sizeof(int));
  if (result == 0)
    return 0;

  for (int i = 0; i < length; ++i) {
    result[i] = array1[i] + array2[i];
  }

  return result;
}

__attribute__((used)) int* negateInt32Array (int *array, int length)
{
  int* result = (int*) malloc(length * sizeof(int));
  if (result == 0)
    return 0;

  for (int i = 0; i < length; ++i) {
    result[i] = -array[i];
  }

  return result;
}
