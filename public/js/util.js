function capitalize(lower) {
  return (lower ? lower.toLowerCase() : lower).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}
